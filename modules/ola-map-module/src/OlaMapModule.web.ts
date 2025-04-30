import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './OlaMapModule.types';

type OlaMapModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class OlaMapModule extends NativeModule<OlaMapModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(OlaMapModule);
