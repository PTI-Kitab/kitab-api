export enum Responses {
  Success = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  ValidationError = 422,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export const successResponse = (
  response: Responses = Responses.Success,
  data: any
) => {
  return {
    code: Responses.Success,
    message: "ok",
    data,
  };
};

export const createdResponse = (data: any) => {
  return {
    code: Responses.Created,
    message: "created",
    data,
  };
};

export const errorResponse = (code: Responses, reason: string) => {
  return {
    code,
    message: Responses[code],
    reason,
  };
};
