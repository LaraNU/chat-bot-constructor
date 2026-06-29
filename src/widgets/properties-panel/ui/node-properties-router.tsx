import { MessageProperties } from './node-properties/message-properties';
import { AppNode } from '@/entities/workflow';

interface Props {
  node: AppNode;
}

export function NodePropertiesRouter({ node }: Props) {
  switch (node.type) {
    case 'message':
      return <MessageProperties node={node} />;

    default:
      return null;
  }
}
