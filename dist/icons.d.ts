import React from 'react';
export type IconName = 'git' | 'file' | 'search' | 'refresh' | 'check' | 'plus' | 'minus' | 'back' | 'close' | 'chevron' | 'copy' | 'commit' | 'wrap' | 'up' | 'down' | 'alert';
export declare function Icon({ name, size, className }: {
    name: IconName;
    size?: number;
    className?: string;
}): React.JSX.Element;
export declare function GitIcon({ size }: {
    size?: number;
}): React.JSX.Element;
