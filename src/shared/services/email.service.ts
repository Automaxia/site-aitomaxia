import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  // ✅ SUAS CONFIGURAÇÕES EMAILJS (já funcionando)
  private emailJSConfig = {
    serviceId: 'service_akiqn9n',
    templateId: 'template_7oq5prv',
    publicKey: '9vwF_fkmZDLFTqQG8'
  };

  constructor(private http: HttpClient) { }

  /**
   * 📧 MÉTODO PRINCIPAL - ENVIO SIMPLES E FUNCIONAL
   */
  async envioemail(subject: string, html_corpo: string, dados_cliente: any): Promise<any> {
    try {
      console.log('🚀 Iniciando envio de e-mail...');
      console.log('📋 Dados do cliente:', dados_cliente);

      // Carregar EmailJS se necessário
      await this.loadEmailJS();

      // Preparar dados para o template
      const templateParams = {
        // ⚠️ ESTES NOMES DEVEM COINCIDIR COM SEU TEMPLATE EMAILJS
        to_email: 'contato@automaxia.com.br',
        subject: subject,
        from_name: dados_cliente.nome,
        from_email: dados_cliente.email,
        phone: dados_cliente.telefone,
        message: this.createSimpleMessage(dados_cliente),
        reply_to: dados_cliente.email
      };

      console.log('📤 Enviando com parâmetros:', templateParams);

      // Enviar via EmailJS
      const response = await (window as any).emailjs.send(
        this.emailJSConfig.serviceId,
        this.emailJSConfig.templateId,
        templateParams,
        this.emailJSConfig.publicKey
      );

      console.log('✅ E-mail enviado com sucesso!', response);
      return { success: true, data: response };

    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      return { success: false, error: error };
    }
  }

  /**
   * 📝 CRIAR MENSAGEM SIMPLES
   */
  private createSimpleMessage(dados: any): string {
    return `
🤖 NOVO CONTATO - SITE AUTOMAXIA

👤 Nome: ${dados.nome}
📧 E-mail: ${dados.email}
📱 Telefone: ${dados.telefone}
⏰ Data/Hora: ${new Date().toLocaleString('pt-BR')}
🌐 Origem: Site Automaxia

---
Este é um e-mail automático do formulário de contato.
Responder para: ${dados.email}
    `.trim();
  }

  /**
   * 📚 CARREGAR BIBLIOTECA EMAILJS
   */
  private loadEmailJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já estiver carregado
      if (typeof (window as any).emailjs !== 'undefined') {
        console.log('📚 EmailJS já está carregado');
        resolve();
        return;
      }

      console.log('📦 Carregando EmailJS...');

      // Carregar script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = () => {
        // Inicializar
        (window as any).emailjs.init(this.emailJSConfig.publicKey);
        console.log('✅ EmailJS carregado e inicializado');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Erro ao carregar EmailJS:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }
}
