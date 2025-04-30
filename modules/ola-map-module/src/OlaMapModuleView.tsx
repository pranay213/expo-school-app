import { requireNativeView } from 'expo';
import * as React from 'react';

import { OlaMapModuleViewProps } from './OlaMapModule.types';

const NativeView: React.ComponentType<OlaMapModuleViewProps> =
  requireNativeView('OlaMapModule');

export default function OlaMapModuleView(props: OlaMapModuleViewProps) {
  return <NativeView {...props} />;
}
