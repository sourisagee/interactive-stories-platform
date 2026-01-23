export type ServerResponseType<DataType> = {
  statusCode: number;
  message: string;
  data: DataType | null;
  error: string | null;
};
