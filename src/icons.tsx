import React from 'react'

export type IconName = 'git' | 'file' | 'search' | 'refresh' | 'check' | 'plus' | 'minus' | 'back' | 'close' | 'chevron' | 'copy' | 'commit' | 'wrap' | 'up' | 'down' | 'alert'
const paths: Record<IconName, React.ReactNode> = {
  git: <><path d="M6 5v14m0-9c0 4 12 0 12 5v4"/><circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></>,
  check: <path d="m5 12 4 4L19 6"/>, plus: <path d="M12 5v14M5 12h14"/>, minus: <path d="M5 12h14"/>,
  back: <path d="m13 5-7 7 7 7M6 12h15"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
  chevron: <path d="m9 5 7 7-7 7"/>, copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/></>,
  commit: <><path d="M2 12h5m10 0h5"/><circle cx="12" cy="12" r="5"/></>,
  wrap: <><path d="M3 6h18M3 11h13a4 4 0 0 1 0 8h-5m3-3-3 3 3 3M3 16h3"/></>,
  up: <path d="m6 15 6-6 6 6"/>, down: <path d="m6 9 6 6 6-6"/>,
  alert: <><path d="m12 3 10 18H2zM12 9v5"/><path d="M12 17h.01"/></>,
}
export function Icon({ name, size = 16, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
export function GitIcon({ size = 20 }: { size?: number }) { return <Icon name="git" size={size}/> }
