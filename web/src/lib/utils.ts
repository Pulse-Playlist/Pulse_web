export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getCadenceZone(spm: number): {
  name: string;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
} {
  if (spm < 130) {
    return {
      name: 'recovery',
      label: 'Recovery / Walk',
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      badgeBg: 'bg-sky-500',
    };
  }
  if (spm < 150) {
    return {
      name: 'aerobic',
      label: 'Aerobic Base',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500',
    };
  }
  if (spm < 165) {
    return {
      name: 'jog',
      label: 'Jogging / Easy',
      textColor: 'text-lime-400',
      bgColor: 'bg-lime-500/10',
      borderColor: 'border-lime-500/30',
      badgeBg: 'bg-lime-500',
    };
  }
  if (spm < 180) {
    return {
      name: 'marathon',
      label: 'Marathon / Tempo',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500',
    };
  }
  return {
    name: 'sprint',
    label: 'Sprint / Fast',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    badgeBg: 'bg-rose-500',
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-amber-400';
  if (score >= 60) return 'text-sky-400';
  return 'text-zinc-400';
}
