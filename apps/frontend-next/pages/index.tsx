import styled from 'styled-components';

const StyledPage = styled.main`
  width: 50%;
  height: 50%;
  background-color: red;
`;

export function Index() {
  return (
    <StyledPage>
      <div className="wrapper">
        <h1>Hello world</h1>
      </div>
    </StyledPage>
  );
}

export default Index;
