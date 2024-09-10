import fastify from 'fastify'
import z from 'zod'
import { createGoal } from '../functions/create-goal'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { getWeekPendingGoals } from '../functions/get-week-pending-goal'
import { createGoalCompletion } from '../functions/create-goal-completion'

const PORT = 3333

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pedding-goals', async () => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number(),
      }),
    },
  },

  async request => {
    const { title, desiredWeeklyFrequency } = request.body

    await createGoal({ desiredWeeklyFrequency, title })
  }
)

app.post(
  '/completions',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async request => {
    const { goalId } = request.body
    await createGoalCompletion({ goalId })
  }
)

app
  .listen({
    port: PORT,
  })
  .then(() => {
    console.log('Server is running on port 3333')
  })
