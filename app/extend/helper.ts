import { Context } from "egg";

interface SuccessArgs {
  ctx: Context;
  resp: any;
  message?: string;
}

export default {
  success({ ctx, resp, message }: SuccessArgs) {
    console.log(ctx, resp, message);
  },
};
