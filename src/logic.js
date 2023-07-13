import { openai } from './openai.js'
import { textConverter } from './text.js'

import { tgIdInWhiteList } from './tgsids.whitelist.js'

export const INITIAL_SESSION = {
  messages: [],
}

export async function initCommand(ctx) {
  if (!tgIdInWhiteList(ctx.update.message.from.id)) {
    return;
  }

  ctx.session = { ...INITIAL_SESSION }
  await ctx.reply('Жду вашего голосового или текстового сообщения')
}

export async function processTextToChat(ctx, content) {
  try {
    ctx.session.messages.push({ role: openai.roles.USER, content })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    })

    const source = await textConverter.textToSpeech(response.content)

    await ctx.sendAudio(
      { source },
      { title: 'Ответ от ассистента', performer: 'ChatGPT' }
    )

    // await ctx.reply(response.content)
  } catch (e) {
    console.log('Error while proccesing text to gpt', e.message)
  }
}
