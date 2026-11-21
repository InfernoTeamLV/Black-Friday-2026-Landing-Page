// Keep linked/focused controls visible before subsequent sections cover the intro.
export function getIntroScrollTop(
  targetTop: number,
  introHeight: number,
  viewportHeight: number
): number {
  const lastUncoveredPosition = Math.max(0, introHeight - viewportHeight);
  return Math.min(Math.max(0, targetTop - 32), lastUncoveredPosition);
}
