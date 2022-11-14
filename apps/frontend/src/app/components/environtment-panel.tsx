import styled from 'styled-components';

export const EnvironmentPanel: React.FC = () => {
  const Container = styled.div`
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    height: 500px;
    width: 300px;
    border: 1px solid lightgrey;
    border-radius: 8px;
    background-color: white;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    box-sizing: border-box;
    overflow: hidden;
  `;

  const PanelTitle = styled.p`
    margin: 0;
    padding: 10px;
    font-family: sans-serif;
    font-weight: 600;
    font-size: 0.8em;
    letter-spacing: 1px;
    border-bottom: 1px solid lightgrey;
  `;

  const PanelContentContainer = styled.div`
    width: 100%;
    height: 100%;
    padding: 10px;
  `;

  return (
    <Container>
      <PanelTitle>Environment</PanelTitle>
      <PanelContentContainer />
    </Container>
  );
};
