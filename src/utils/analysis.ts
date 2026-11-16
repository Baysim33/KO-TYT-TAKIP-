import type { ExamResult, WrongQuestion, CheckedTopics } from '@/types';
import { subjects } from '@/data/curriculum';

export interface SubjectTopicError {
  topic: string;
  count: number;
  questionTypes: string[];
  unsolvedCount: number;
}

export interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  net: number;
  maxNet: number;
  isWeak: boolean;
  wrongCount: number;
  topErrorTopics: SubjectTopicError[];
  topQuestionPattern: { pattern: string; count: number } | null;
}

export interface AnalysisResult {
  weakestArea: string;
  weakestNet: number;
  strongestArea: string;
  strongestNet: number;
  totalNet: number;
  estimatedScore: number;
  recommendations: string[];
  patternWarnings: string[];
  subjectBreakdown: { area: string; net: number; isWeak: boolean }[];
  subjectAnalyses: SubjectAnalysis[];
  progressTrend: 'up' | 'down' | 'stable' | 'none';
  progressDelta: number;
}

const subjectGroups: Record<string, string> = {
  turkce: 'Türkçe',
  matematik: 'Matematik',
  fizik: 'Fizik',
  kimya: 'Kimya',
  biyoloji: 'Biyoloji',
  tarih: 'Tarih',
  cografya: 'Coğrafya',
  felsefe: 'Felsefe',
  din: 'Din Kültürü',
};

// Map exam subject buckets to the individual subject IDs they contain.
const examBucketToSubjectIds: Record<string, string[]> = {
  'Türkçe': ['turkce'],
  'Sosyal Bilimler': ['tarih', 'cografya', 'felsefe', 'din'],
  'Matematik': ['matematik'],
  'Fen Bilimleri': ['fizik', 'kimya', 'biyoloji'],
};

export function analyzeExams(
  latest: ExamResult,
  history: ExamResult[],
  wrongQuestions: WrongQuestion[],
  checkedTopics: CheckedTopics,
): AnalysisResult {
  const subjectNets: { area: string; net: number }[] = [
    { area: 'Türkçe', net: latest.turkce },
    { area: 'Sosyal Bilimler', net: latest.sosyal },
    { area: 'Matematik', net: latest.matematik },
    { area: 'Fen Bilimleri', net: latest.fen },
  ];

  const sorted = [...subjectNets].sort((a, b) => a.net - b.net);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  const weakThreshold = 10;
  const weakAreas = subjectNets.filter(s => s.net <= weakThreshold);

  const subjectBreakdown = subjectNets.map(s => ({
    ...s,
    isWeak: s.net <= weakThreshold,
  }));

  // Gerçek ÖSYM TYT Puan Hesaplama Katsayıları (Taban 100, Max 500)
  const estimatedScore = Math.min(
    500,
    Math.round(100 + latest.turkce * 3.3 + latest.matematik * 3.3 + latest.sosyal * 3.4 + latest.fen * 3.4)
  );

  // Progress trend
  let progressTrend: AnalysisResult['progressTrend'] = 'none';
  let progressDelta = 0;
  if (history.length >= 2) {
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const prev = sortedHistory[sortedHistory.length - 2];
    const curr = sortedHistory[sortedHistory.length - 1];
    progressDelta = curr.total - prev.total;
    if (Math.abs(progressDelta) < 1) progressTrend = 'stable';
    else progressTrend = progressDelta > 0 ? 'up' : 'down';
  }

  // ---- Deep per-subject analysis from the wrong notebook ----
  // For each subject, aggregate topic-level and question-pattern-level error data.
  const subjectAnalyses: SubjectAnalysis[] = subjects.map(subjectData => {
    const subjectWrong = wrongQuestions.filter(q => q.subject === subjectData.id);

    // Topic-level aggregation
    const topicMap = new Map<string, SubjectTopicError>();
    for (const q of subjectWrong) {
      const existing = topicMap.get(q.topic);
      if (existing) {
        existing.count++;
        if (q.questionType && q.questionType !== 'Genel' && !existing.questionTypes.includes(q.questionType)) {
          existing.questionTypes.push(q.questionType);
        }
        if (!q.solved) existing.unsolvedCount++;
      } else {
        topicMap.set(q.topic, {
          topic: q.topic,
          count: 1,
          questionTypes: q.questionType && q.questionType !== 'Genel' ? [q.questionType] : [],
          unsolvedCount: q.solved ? 0 : 1,
        });
      }
    }

    const topErrorTopics = [...topicMap.values()].sort((a, b) => b.count - a.count).slice(0, 3);

    // Question-pattern aggregation
    const patternMap = new Map<string, number>();
    for (const q of subjectWrong) {
      const pattern = q.questionType && q.questionType !== 'Genel' ? q.questionType : q.topic;
      patternMap.set(pattern, (patternMap.get(pattern) ?? 0) + 1);
    }
    const sortedPatterns = [...patternMap.entries()].sort((a, b) => b[1] - a[1]);
    const topQuestionPattern = sortedPatterns.length > 0
      ? { pattern: sortedPatterns[0][0], count: sortedPatterns[0][1] }
      : null;

    // Determine which exam bucket this subject belongs to and whether it's weak.
    const examBucket = Object.entries(examBucketToSubjectIds).find(([, ids]) => ids.includes(subjectData.id))?.[0];
    const bucketNet = examBucket ? subjectNets.find(s => s.area === examBucket)?.net ?? 0 : 0;
    const maxNet = examBucket === 'Türkçe' || examBucket === 'Matematik' ? 40 : 20;

    return {
      subjectId: subjectData.id,
      subjectName: subjectData.name,
      net: bucketNet,
      maxNet,
      isWeak: bucketNet <= weakThreshold,
      wrongCount: subjectWrong.length,
      topErrorTopics,
      topQuestionPattern,
    };
  });

  // ---- Global pattern warnings (top recurring error patterns across all subjects) ----
  const globalPatternCounts: Record<string, { count: number; subject: string }> = {};
  for (const q of wrongQuestions) {
    const key = q.questionType && q.questionType !== 'Genel' ? q.questionType : q.topic;
    const fullKey = `${subjectGroups[q.subject] ?? q.subject} - ${key}`;
    if (!globalPatternCounts[fullKey]) {
      globalPatternCounts[fullKey] = { count: 0, subject: q.subject };
    }
    globalPatternCounts[fullKey].count++;
  }

  const sortedGlobalPatterns = Object.entries(globalPatternCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const patternWarnings: string[] = [];
  for (const [pattern, info] of sortedGlobalPatterns) {
    if (info.count >= 2) {
      patternWarnings.push(
        `"${pattern}" kalıbında ${info.count} kez hata yapmışsın. Bu konuya özel tekrar gerek.`,
      );
    }
  }

  // ---- Build pinpoint recommendations ----
  const recommendations: string[] = [];

  // 1) Weakest area + its top wrong-notebook topic (pinpoint guidance)
  if (weakAreas.length > 0) {
    for (const weak of weakAreas) {
      const bucketSubjectIds = examBucketToSubjectIds[weak.area] ?? [];
      // Among the subjects in this weak bucket, find the one with the most wrong-notebook errors.
      const subjectErrorsInBucket = bucketSubjectIds
        .map(id => {
          const sa = subjectAnalyses.find(s => s.subjectId === id);
          return { id, wrongCount: sa?.wrongCount ?? 0, sa };
        })
        .sort((a, b) => b.wrongCount - a.wrongCount);

      const topSubject = subjectErrorsInBucket[0];
      if (topSubject && topSubject.wrongCount > 0 && topSubject.sa) {
        const topTopic = topSubject.sa.topErrorTopics[0];
        const topPattern = topSubject.sa.topQuestionPattern;
        if (topTopic) {
          let rec = `Netlerin düşük olduğu ${weak.area} dersinde, özellikle Yanlış Defteri'nde en çok `;
          if (topPattern && topPattern.count >= 2) {
            rec += `"${topPattern.pattern}" soru kalıbında `;
          } else {
            rec += `"${topTopic.topic}" konusunda `;
          }
          rec += `hata yapıyorsun (${topTopic.count} yanlış kayıt). Önce bu soru kalıbına çalışmalısın.`;
          recommendations.push(rec);
        }
      } else {
        // No wrong-notebook data for this weak area — generic guidance
        if (weak.net < 5) {
          recommendations.push(
            `${weak.area} netlerin çok düşük (${weak.net} net). Bu alana günlük en az 2 saat ayırmalısın. Temel konulardan başlayarak eksikliklerini kapat. Yanlış defterine bu dersten soru eklemeyi unutma — analiz daha nokta atışı olabilir.`,
          );
        } else {
          recommendations.push(
            `${weak.area} alanında ${weak.net} net ile en zayıf dersin. Bu dersin konu takip matrisindeki eksik konuları öncelikli olarak tamamla.`,
          );
        }
      }
    }
  }

  // 2) Per-subject pinpoint recommendations based on wrong notebook data
  for (const sa of subjectAnalyses) {
    if (sa.wrongCount === 0) continue;
    const topTopic = sa.topErrorTopics[0];
    const topPattern = sa.topQuestionPattern;

    // Skip if already covered in the weak-area section above (to avoid duplicates)
    const alreadyCovered = weakAreas.some(w => {
      const ids = examBucketToSubjectIds[w.area] ?? [];
      return ids.includes(sa.subjectId);
    }) && recommendations.some(r => r.includes(sa.subjectName) && r.includes(topTopic?.topic ?? '___NOMATCH___'));

    if (alreadyCovered) continue;

    if (topTopic && topTopic.count >= 2) {
      let rec = `${sa.subjectName} dersinde Yanlış Defteri'ne bakıldığında en çok "${topTopic.topic}" konusunda hata yapıyorsun (${topTopic.count} kayıt`;
      if (topTopic.unsolvedCount > 0) {
        rec += `, ${topTopic.unsolvedCount} tanesi hâlâ çözülmedi`;
      }
      rec += `). `;
      if (topPattern && topPattern.count >= 2 && topPattern.pattern !== topTopic.topic) {
        rec += `Soru kalıbı olarak "${topPattern.pattern}" tipine dikkat et. `;
      }
      rec += `Önce bu konuya çalış, ardından defterindeki bu soruları tekrar çöz.`;
      recommendations.push(rec);
    }
  }

  // 3) Cross-reference weak exam buckets with specific subjects + topics
  if (weakAreas.length > 0 && sortedGlobalPatterns.length > 0) {
    const firstPattern = sortedGlobalPatterns[0];
    if (firstPattern) {
      const patternSubject = firstPattern[1].subject;
      const subjectName = subjectGroups[patternSubject] ?? patternSubject;
      const patternTopic = firstPattern[0].split(' - ')[1];
      const weakArea = weakAreas.find(w => {
        const ids = examBucketToSubjectIds[w.area] ?? [];
        return ids.includes(patternSubject);
      });

      if (weakArea) {
        recommendations.push(
          `${subjectName} netlerin düşük VE Yanlış Defterinde en çok "${patternTopic}" konusunda hata var. Öncelikli olarak bu konuya odaklan, sonra bu soru kalıbından bol bol pratik yap.`,
        );
      }
    }
  }

  // 4) Subject progress (checked topics) recommendations
  for (const subject of subjects) {
    const total = subject.topics.length;
    const done = subject.topics.reduce((acc, _, i) => acc + (checkedTopics[`${subject.id}-${i}`] ? 1 : 0), 0);
    const pct = (done / total) * 100;

    if (pct < 30) {
      recommendations.push(
        `${subject.name} dersinde konu takip ilerlemen sadece %${Math.round(pct)}. Daha fazla konuyu işaretleyerek çalışma planını güncelle.`,
      );
    }
  }

  // 5) Positive reinforcement
  if (strongest.net >= 25) {
    recommendations.push(
      `${strongest.area} alanında ${strongest.net} net ile çok iyisin! Bu gücü korurken zayıf derslerine daha fazla zaman ayır.`,
    );
  }

  if (progressTrend === 'up' && progressDelta >= 3) {
    recommendations.push(
      `Son denemede netlerin ${progressDelta > 0 ? '+' : ''}${progressDelta} artış gösterdi. Bu tempoyla devam et, harika gidiyorsun!`,
    );
  } else if (progressTrend === 'down' && progressDelta <= -3) {
    recommendations.push(
      `Son denemede netlerin ${progressDelta} düştü. Motivasyonunu kaybetme — bir adım geri alıp temel konuları tekrar et.`,
    );
  }

  if (wrongQuestions.length > 0) {
    const unsolvedCount = wrongQuestions.filter(q => !q.solved).length;
    if (unsolvedCount > 5) {
      recommendations.push(
        `Yanlış Defterinde ${unsolvedCount} çözülmemiş soru var. Her gün en az 3 tanesini tekrar ederek bu sayıyı azalt.`,
      );
    }
  }

  const uniqueRecs = [...new Set(recommendations)].slice(0, 8);

  return {
    weakestArea: weakest.area,
    weakestNet: weakest.net,
    strongestArea: strongest.area,
    strongestNet: strongest.net,
    totalNet: latest.total,
    estimatedScore,
    recommendations: uniqueRecs,
    patternWarnings,
    subjectBreakdown,
    subjectAnalyses,
    progressTrend,
    progressDelta,
  };
}
