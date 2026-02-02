import { is } from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function FlowablePropertiesProvider(propertiesPanel, translate) {
  this.getGroups = function(element) {
    return function(groups) {
      if (is(element, 'bpmn:UserTask')) {
        groups.push(createFlowableUserTaskGroup(element, translate));
      }
      if (is(element, 'bpmn:StartEvent')) {
        groups.push(createFlowableStartEventGroup(element, translate));
      }
      return groups;
    };
  };

  propertiesPanel.registerProvider(this);
}

FlowablePropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];

function createFlowableUserTaskGroup(element, translate) {
  const group = {
    id: 'flowable',
    label: translate('Flowable Configuration'),
    entries: []
  };

  group.entries.push({
    id: 'assignee',
    component: AssigneeProps,
    isEdited: isTextFieldEntryEdited
  });
  
  group.entries.push({
    id: 'candidateUsers',
    component: CandidateUsersProps,
    isEdited: isTextFieldEntryEdited
  });
  
  group.entries.push({
    id: 'candidateGroups',
    component: CandidateGroupsProps,
    isEdited: isTextFieldEntryEdited
  });

  group.entries.push({
    id: 'formKey',
    component: FormKeyProps,
    isEdited: isTextFieldEntryEdited
  });

  group.entries.push({
    id: 'dueDate',
    component: DueDateProps,
    isEdited: isTextFieldEntryEdited
  });

  group.entries.push({
    id: 'priority',
    component: PriorityProps,
    isEdited: isTextFieldEntryEdited
  });

  return group;
}

function createFlowableStartEventGroup(element, translate) {
  const group = {
    id: 'flowable-start',
    label: translate('Flowable Configuration'),
    entries: []
  };

  group.entries.push({
    id: 'startFormKey',
    component: StartFormKeyProps,
    isEdited: isTextFieldEntryEdited
  });

  return group;
}

function StartFormKeyProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.formKey || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      formKey: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'startFormKey',
    label: translate('Form Key'),
    getValue,
    setValue,
    debounce
  });
}

function AssigneeProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.assignee || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      assignee: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'assignee',
    label: translate('Assignee'),
    getValue,
    setValue,
    debounce
  });
}

function CandidateUsersProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.candidateUsers || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      candidateUsers: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateUsers',
    label: translate('Candidate Users'),
    getValue,
    setValue,
    debounce
  });
}

function CandidateGroupsProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.candidateGroups || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      candidateGroups: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateGroups',
    label: translate('Candidate Groups'),
    getValue,
    setValue,
    debounce
  });
}

function FormKeyProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.formKey || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      formKey: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'formKey',
    label: translate('Form Key'),
    getValue,
    setValue,
    debounce
  });
}

function DueDateProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.dueDate || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      dueDate: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'dueDate',
    label: translate('Due Date'),
    getValue,
    setValue,
    debounce
  });
}

function PriorityProps(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    return element.businessObject.priority || '';
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
      priority: value
    });
  };

  return TextFieldEntry({
    element,
    id: 'priority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}
