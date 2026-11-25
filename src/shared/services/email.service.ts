import { Injectable } from '@angular/core';

export interface DadosContato {
  nome: string;
  email: string;
  telefone: string;
}

/**
 * Envio do formulário de contato pelo EmailJS (direto do navegador).
 *
 * Os IDs e a chave pública ficam visíveis no site por natureza do EmailJS. A proteção está no
 * painel do EmailJS: o destinatário do template é fixo (contato@automaxia.com.br, conferido em
 * 25/11/2026), a resposta automática está desligada e a API fora do navegador está bloqueada.
 * Por isso NÃO enviamos destinatário daqui.
 */
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private readonly emailJSConfig = {
    serviceId: 'service_akiqn9n',
    templateId: 'template_7oq5prv',
    publicKey: '9vwF_fkmZDLFTqQG8'
  };

  async envioemail(subject: string, dados: DadosContato): Promise<{ success: boolean; error?: unknown }> {
    try {
      await this.loadEmailJS();

      // Nomes iguais aos usados no template do EmailJS ({{name}}, {{reply_to}}, ...).
      const templateParams = {
        subject,
        name: dados.nome,
        from_name: dados.nome,
        from_email: dados.email,
        phone: dados.telefone,
        message: this.criarMensagem(dados),
        reply_to: dados.email
      };

      await (window as any).emailjs.send(
        this.emailJSConfig.serviceId,
        this.emailJSConfig.templateId,
        templateParams,
        this.emailJSConfig.publicKey
      );
      return { success: true };

    } catch (error) {
      // Sem dados pessoais no console: só o status devolvido pelo EmailJS, se houver.
      console.error('EmailJS: falha no envio', (error as any)?.status ?? '');
      return { success: false, error };
    }
  }

  private criarMensagem(dados: DadosContato): string {
    return [
      'Novo contato pelo site automaxia.com.br',
      '',
      `Nome: ${dados.nome}`,
      `E-mail: ${dados.email}`,
      `Telefone: ${dados.telefone}`,
      `Data/hora: ${new Date().toLocaleString('pt-BR')}`,
    ].join('\n');
  }

  private loadEmailJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).emailjs !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = () => {
        (window as any).emailjs.init(this.emailJSConfig.publicKey);
        resolve();
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }
}
