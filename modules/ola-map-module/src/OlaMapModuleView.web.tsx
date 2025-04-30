import * as React from 'react';

import { OlaMapModuleViewProps } from './OlaMapModule.types';

export default function OlaMapModuleView(props: OlaMapModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
