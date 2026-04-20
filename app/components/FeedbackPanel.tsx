'use client';

export default function FeedbackPanel({ feedback }: { feedback: string }) {
  if (!feedback) return null;

  // Parse score from feedback text e.g. "Score: 7/10"
  const scoreMatch = feedback.match(/(\d+)\s*\/\s*10/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const scoreColor = score === null ? 'text-gray-400'
    : score >= 8 ? 'text-green-400'
    : score >= 5 ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="p-5 bg-gray-900 border border-green-700 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-green-400 text-lg">📊 Feedback</h3>
        {score !== null && (
          <span className={`text-2xl font-bold ${scoreColor}`}>
            {score}/10
          </span>
        )}
      </div>

      {/* Score bar */}
      {score !== null && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${
              score >= 8 ? 'bg-green-400'
              : score >= 5 ? 'bg-yellow-400'
              : 'bg-red-400'
            }`}
            style={{ width: `${score * 10}%` }}
          />
        </div>
      )}

      <p className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
        {feedback}
      </p>
    </div>
  );
}