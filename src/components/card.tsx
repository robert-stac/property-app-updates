export const Card = ({ children }: any) => (
  <div className="bg-white shadow rounded-lg p-4">{children}</div>
);

export const CardHeader = ({ children }: any) => (
  <div className="mb-2 font-semibold text-black">{children}</div>
);

export const CardTitle = ({ children }: any) => (
  <h2 className="text-lg font-bold">{children}</h2>
);

export const CardContent = ({ children }: any) => (
  <div className="text-gray-700">{children}</div>
);
