import { Router, Request, Response } from "express";
import { SearchInputSchema } from "../utils/schemas";
import { runSearch } from "../search_tool/searchChain";

export const searchRouter = Router();

searchRouter.post("/", async (req: Request, res: Response) => {
  try {
    const input = SearchInputSchema.parse(req.body);
    const result = await runSearch(input);

    res.status(200).json(result);
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : "An error occurred while processing the search request.";

    res.status(400).json({ error: msg });
  }
});
