import S from '../station-card.module.css';

type StationTitleProps = {
  name: string;
  searchQuery?: string;
};

export const StationTitle = (props: StationTitleProps) => {
  const { name, searchQuery = '' } = props;

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

  if (normalizedQuery.length === 0) {
    return name;
  }

  const parts: Array<{ text: string; isMatch: boolean }> = [];

  let remaining = name;
  let lowerRemaining = name.toLocaleLowerCase();

  while (true) {
    const index = lowerRemaining.indexOf(normalizedQuery);

    if (index === -1) {
      if (remaining.length > 0) {
        parts.push({ text: remaining, isMatch: false });
      }

      break;
    }

    if (index > 0) {
      parts.push({
        text: remaining.slice(0, index),
        isMatch: false,
      });
    }

    parts.push({
      text: remaining.slice(index, index + normalizedQuery.length),
      isMatch: true,
    });

    remaining = remaining.slice(index + normalizedQuery.length);
    lowerRemaining = lowerRemaining.slice(index + normalizedQuery.length);
  }

  return (
    <>
      {parts.map((part, index) =>
        part.isMatch ? (
          <mark key={index} className={S.highlight}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
};
