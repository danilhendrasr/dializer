import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  display: flex;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  width: fit-content;
  padding: 7px 12px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid lightgrey;
  gap: 10px;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
`;

export const ControlPanel: React.FC<PropsWithChildren> = (props) => {
  return <Container>{props.children}</Container>;
};
