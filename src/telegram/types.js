/* @flow */

export type User = {
  id: string,
  first_name?: ?string,
  last_name?: ?string,
  username?: string,
};
export type Chat = {
  id: string,
  type: 'private' | 'group' | 'supergroup' | 'channel',
  title?: string,
  first_name?: string,
  last_name?: string,
  username?: string,
};
export type ParseMode = 'Markdown' | 'HTML';
export type Message = {
  from: User,
  chat: Chat,
  text?: string,
};
export type InlineQuery = {
  id: string,
  from: User,
  query: string,
};
export type InlineQueryResult = {
  type: 'article',
  id: string,
  title: string,
  input_message_content: {
    message_text: string,
    parse_mode?: ParseMode,
    disable_web_page_preview?: boolean,
  },
  url?: string,
  hide_url?: boolean,
  description?: string,
  thumb_url?: string,
  thumb_width?: number,
  thumb_height?: number,
};
