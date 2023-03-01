type AuthTitleProps = {
  children: React.ReactNode;
};

const AuthTitle: React.FC<AuthTitleProps> = (props) => {
  return (
    <h1 className="text-4xl text-center font-bold tracking-wider font-sans m-5 text-accent2">
      {props.children}
    </h1>
  );
};

export { AuthTitle };
