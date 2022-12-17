import { PlayerPause, PlayerPlay } from 'tabler-icons-react';

type Props = {
  isAnimationRunning: boolean;
  onClick: () => void;
};

export const ToggleAnimationBtn: React.FC<Props> = (props) => {
  const { isAnimationRunning, onClick } = props;

  return isAnimationRunning ? (
    <PlayerPause size={15} fill={'red'} onClick={onClick} cursor="pointer" />
  ) : (
    <PlayerPlay size={15} fill={'#90EE90'} onClick={onClick} cursor="pointer" />
  );
};
