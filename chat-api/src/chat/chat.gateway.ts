import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface IMessage {
  id: number;
  username: string;
  content: string;
  translated: string;
  translatedFor: string;
  timeSent: string;
  verified: boolean;
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  clients: { client: Socket; username?: string }[] = [];
  chatMessages: IMessage[] = [];

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.server.emit('message', payload);
    return 'Hello world!';
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(client: any, payload: IMessage): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c.username) {
      payload.id = this.chatMessages.length;
      this.server.emit('chat-message', {
        ...payload,
        username: c.username,
      });
      this.chatMessages[payload.id] = {
        ...payload,
        username: c.username,
      };
    }
  }

  @SubscribeMessage('chat-translate')
  async handleChatTranslate(langage: string, payload) {
    const messageIndex = this.chatMessages.findIndex((msg) => msg.id === payload.message.id);

    if (messageIndex !== -1) {
      // Assuming `handleMessageContent` returns a Promise<string>
      const translatedContent = await handleMessageContent(payload.message.content, payload.selectedLanguage);
      // Create a new array with the translated message
      payload.message.translated = translatedContent;
      payload.message.translatedFor = payload.username;
      this.chatMessages[messageIndex].translated = translatedContent;
      this.chatMessages[messageIndex].translatedFor = payload.username
      // Emit the translated message
      this.server.emit('chat-update', {
        ...payload.message,
        username: payload.message.username,
      });
    }
  }

  @SubscribeMessage('chat-verified')
  async handleChatVerified(payload) {
    const messageIndex = this.chatMessages.findIndex((msg) => msg.id === payload.id);

    if (messageIndex !== -1) {
      // Assuming `handleMessageContent` returns a Promise<string>
      const verifiedContent = await handleValidateMessage(payload.content);

      // Create a new array with the translated message
      payload.verified = verifiedContent;
      this.chatMessages[messageIndex].verified = verifiedContent;
      // Emit the translated message
      this.server.emit('chat-update', {
        ...payload.message,
        username: payload.username,
      });
    }
  }

  @SubscribeMessage('username-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c) {
      c.username = payload.username;
    }
  }

  @SubscribeMessage('chat-suggest')
  async handleChatSuggest() {
    const suggestedText = await handleSuggestedText(this.chatMessages);
    this.server.emit('chat-suggest', {
      texte: suggestedText,
    });
  }

  handleConnection(client: Socket) {
    console.log('client connected ', client.id);
    this.clients.push({
      client,
    });
    client.emit('messages-old', this.chatMessages);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.clients = this.clients.filter((c) => c.client.id !== client.id);
  }
}

async function handleMessageContent(content, langage) {
  // Votre URL API
  const apiUrl = "https://booty-somewhat-tooth-rr.trycloudflare.com/api/v1/generate";

  // Vos paramètres pour l'appel API
  const apiParams = {
    max_context_length: 1600,
    max_length: 120,
    prompt: 'Translate the following message in ' + langage + ' : "' + content + '"',
    quiet: false,
    rep_pen: 1.1,
    rep_pen_range: 256,
    rep_pen_slope: 1,
    temperature: 0.7,
    tfs: 1,
    top_a: 0,
    top_k: 100,
    top_p: 0.92,
    typical: 1
  };

  try {
    // Effectuer la requête API avec la méthode fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiParams),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.results[0].text;
    }
  } catch (error) {
    console.error("Erreur inattendue", error);
    return false;
  }
}

async function handleSuggestedText(messages) {
  // Votre URL API
  const apiUrl = "https://booty-somewhat-tooth-rr.trycloudflare.com/api/v1/generate";
  const recentMessages = messages.slice(-6);
  let formattedMessages = '';
  formattedMessages = recentMessages.map(message => `${message.username}: ${message.content}`).join('\n');
  // Vos paramètres pour l'appel API
  const apiParams = {
    max_context_length: 1600,
    max_length: 120,
    prompt: formattedMessages + ' Previous messages are your context, give me the next part',
    quiet: false,
    rep_pen: 1.1,
    rep_pen_range: 256,
    rep_pen_slope: 1,
    temperature: 0.7,
    tfs: 1,
    top_a: 0,
    top_k: 100,
    top_p: 0.92,
    typical: 1
  };

  try {
    // Effectuer la requête API avec la méthode fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiParams),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.results[0].text;
    }
  } catch (error) {
    console.error("Erreur inattendue", error);
    return false;
  }
}

async function handleValidateMessage(content) {
  // Votre URL API
  const apiUrl = "https://booty-somewhat-tooth-rr.trycloudflare.com/api/v1/generate";

  // Vos paramètres pour l'appel API
  const apiParams = {
    max_context_length: 1600,
    max_length: 120,
    prompt: 'Répond par "vrai" ou "faux" uniquement à l\'affirmation suivante : "' + content + '"',
    quiet: false,
    rep_pen: 1.1,
    rep_pen_range: 256,
    rep_pen_slope: 1,
    temperature: 0.7,
    tfs: 1,
    top_a: 0,
    top_k: 100,
    top_p: 0.92,
    typical: 1
  };

  try {
    // Effectuer la requête API avec la méthode fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiParams),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.results[0].text;
    }
  } catch (error) {
    console.error("Erreur inattendue", error);
    return false;
  }
}