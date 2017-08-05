/* @flow */

export type UserType = {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
  username?: string,
};
export type ChatType = {
  id: string,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title?: string,
  first_name?: string,
  last_name?: string,
  username?: string,
};
export type ParseModeType = 'Markdown' | 'HTML';
export type MessageType = {
  from: UserType,
  chat: ChatType,
  text?: string,
};
export type InlineQueryType = {
  id: string,
  from: UserType,
  query: string,
};
export type InlineQueryResultType = {
  type: 'article',
  id: string,
  title: string,
  input_message_content: {
    message_text: string,
    parse_mode?: ParseModeType,
    disable_web_page_preview?: boolean,
  },
  url?: string,
  hide_url?: boolean,
  description?: string,
  thumb_url?: string,
  thumb_width?: number,
  thumb_height?: number,
};
