import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Todo } from './todo.entity';
import { CreateTodoInput } from './todo.dto';

const pubSub = new PubSub();

@Resolver()
export class TodosResolver {
  todos = [];

  @Query(() => [Todo])
  getTodos() {
    return this.todos;
  }

  @Mutation(() => Todo)
  createTodo(@Args('input') input: CreateTodoInput) {
    const todo = {
      id: Date.now().toString(),
      title: input.title,
      completed: false,
    };
    this.todos.push(todo);
    pubSub.publish('todoCreated', { todoCreated: todo });
    return todo;
  }

  @Mutation(() => Todo)
  toggleTodoCompleted(@Args('id') id: string) {
    const todo = this.todos.find((todo) => todo.id === id);
    todo.completed = !todo.completed;
    pubSub.publish('todoCompleted', { todoCompleted: todo });
    return todo;
  }

  @Subscription(() => Todo)
  todoCreated() {
    return pubSub.asyncIterator('todoCreated');
  }

  @Subscription(() => Todo)
  todoCompleted() {
    return pubSub.asyncIterator('todoCompleted');
  }
}
