import styled from 'styled-components';
import { PlayerPause, PlayerPlay } from 'tabler-icons-react';

type Props = {
  isAnimationRunning: boolean;
  onClick: () => void;
};

export const ToggleAnimationBtn: React.FC<Props> = (props) => {
  const { isAnimationRunning, onClick } = props;

  const StyledBtn = styled.button`
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    width: fit-content;
    padding: 7px 12px;
    background-color: white;
    border-radius: 5px;
    border: 1px solid lightgrey;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  `;

  return (
    <StyledBtn onClick={onClick}>
      {isAnimationRunning ? (
        <PlayerPause size={15} fill={'black'} />
      ) : (
        <PlayerPlay size={15} fill={'black'} />
      )}
    </StyledBtn>
  );
};
