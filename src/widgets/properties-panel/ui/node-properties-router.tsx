import { MessageProperties } from './node-properties/message-properties';
import { QuestionProperties } from './node-properties/question-properties';
import { ChoiceProperties } from './node-properties/choice-properties';
import { ConditionProperties } from './node-properties/condition-properties';
import { EndProperties } from './node-properties/end-properties';
import { SummaryProperties } from './node-properties/summary-properties';
import { AppNode } from '@/entities/workflow';

interface Props {
  node: AppNode;
}

export function NodePropertiesRouter({ node }: Props) {
  switch (node.type) {
    case 'message':
      return <MessageProperties node={node} />;

    case 'question':
      return <QuestionProperties node={node} />;

    case 'choice':
      return <ChoiceProperties node={node} />;

    case 'condition':
      return <ConditionProperties node={node} />;

    case 'end':
      return <EndProperties node={node} />;

    case 'summary':
      return <SummaryProperties node={node} />;

    default:
      return null;
  }
}
