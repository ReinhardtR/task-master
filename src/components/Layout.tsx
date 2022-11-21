type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <div className="max-w-7xl mx-auto text-white py-8 px-6">{children}</div>
  );
}
