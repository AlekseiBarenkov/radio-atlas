import S from './notice.module.css';

type NoticeProps = {
  title: string;
  tone?: 'default' | 'error';
};

export const Notice = (props: NoticeProps) => {
  const { title, tone = 'default' } = props;

  return <div className={`${S.notice} ${tone === 'error' ? S.noticeError : ''}`}>{title}</div>;
};
