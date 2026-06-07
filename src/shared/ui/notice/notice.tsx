import S from './notice.module.css';

type NoticeTone = 'default' | 'error' | 'info';

type NoticeProps = {
  title: string;
  tone?: NoticeTone;
};

export const Notice = (props: NoticeProps) => {
  const { title, tone = 'default' } = props;

  return (
    <div className={S.notice} data-tone={tone}>
      {title}
    </div>
  );
};
