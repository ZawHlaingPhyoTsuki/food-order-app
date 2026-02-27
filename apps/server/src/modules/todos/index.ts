import { TodoPlain, TodoPlainInputCreate } from "@/generated/prismabox/Todo";
import { prisma } from "@/lib/prisma";
import Elysia, { t } from "elysia";

export const todos = new Elysia({ prefix: "/api/todos" })
  // get all todos
  .get(
    "/",
    async () => {
      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: "desc" },
      });
      return todos;
    },
    {
      response: t.Array(TodoPlain),
    },
  )

  // get a single todo by ID
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      const todo = await prisma.todo.findUnique({
        where: { id },
      });

      if (!todo) {
        set.status = 404;
        return {
          error: "Todo not found",
        };
      }

      return todo;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      response: {
        200: TodoPlain,
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  // create a new todo
  .post(
    "/",
    async ({ body }) => {
      const todo = await prisma.todo.create({
        data: {
          title: body.title,
        },
      });

      return todo;
    },
    {
      body: TodoPlainInputCreate,
      response: TodoPlain,
    },
  )
  // update a todo
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const id = Number(params.id);

      try {
        const todo = await prisma.todo.update({
          where: { id },
          data: {
            title: body.title,
          },
        });
        return todo;
      } catch {
        set.status = 404;
        return { error: "Todo not found" };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: TodoPlainInputCreate,
      response: {
        200: TodoPlain,
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  )

  // Toggle todo completion
  .patch(
    "/:id/toggle",
    async ({ params, set }) => {
      const id = Number(params.id);

      try {
        const todo = await prisma.todo.findUnique({
          where: { id },
        });

        if (!todo) {
          set.status = 404;
          return { error: "Todo not found" };
        }

        const updatedTodo = await prisma.todo.update({
          where: { id },
          data: {
            completed: !todo.completed,
          },
        });

        return updatedTodo;
      } catch {
        set.status = 404;
        return { error: "Todo not found" };
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: {
        200: TodoPlain,
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  )

  // Delete a todo
  .delete(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      try {
        const todo = await prisma.todo.delete({
          where: { id },
        });
        return todo;
      } catch {
        set.status = 404;
        return { error: "Todo not found" };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      response: {
        200: TodoPlain,
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  );
