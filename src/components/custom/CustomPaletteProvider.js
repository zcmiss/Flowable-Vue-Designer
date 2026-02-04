export default class CustomPaletteProvider {
  constructor(palette, create, elementFactory, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      create,
      elementFactory,
      translate
    } = this;

    function createUserTask(event) {
      const shape = elementFactory.createShape({ type: 'bpmn:UserTask' });
      create.start(event, shape);
    }

    return {
      'create.task': {
        group: 'activity',
        className: 'bpmn-icon-user-task',
        title: translate('Create User Task'),
        action: {
          dragstart: createUserTask,
          click: createUserTask
        }
      }
    };
  }
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'translate'
];