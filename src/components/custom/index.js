import CustomContextPadProvider from './CustomContextPadProvider';
import CustomPaletteProvider from './CustomPaletteProvider';

export default {
  __init__: ['customContextPadProvider', 'customPaletteProvider'],
  customContextPadProvider: ['type', CustomContextPadProvider],
  customPaletteProvider: ['type', CustomPaletteProvider]
};
