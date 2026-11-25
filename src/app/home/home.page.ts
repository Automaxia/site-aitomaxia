import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../shared/services/email.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { SERVICOS } from '../../shared/constants/servicos';
import { BreakPointType, ResponsiveService } from "../../shared/services/responsive.service";

// ✅ ADICIONE estas importações do Ionic:
import { ToastController, LoadingController } from '@ionic/angular';

function formatPhoneNumber(phoneNumber: any) {
  // Remover todos os caracteres não numéricos do número
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  // Verificar se o número tem o tamanho esperado
  if (cleanedNumber.length === 10) {
    const areaCode = cleanedNumber.slice(0, 2);
    const firstPart = cleanedNumber.slice(2, 6);
    const secondPart = cleanedNumber.slice(6, 10);

    return `(${areaCode}) ${firstPart}-${secondPart}`;
  } else {
    // Caso o número não tenha o tamanho esperado, retornar o número original
    return phoneNumber;
  }
}

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false
})
export class HomePage {

  tipoDispositivo = 'mobile';
  emailForm: FormGroup;
  telefone = '';
  nome = ''
  slidesPerView = 5;
  slidesPerViewSolucoes = 3;
  @ViewChild('home') home: ElementRef;
  @ViewChild('sobre') sobre: ElementRef;
  @ViewChild('contato') contato: ElementRef;
  @ViewChild('servicos') servicos: ElementRef;
  @ViewChild('solucoes') solucoes: ElementRef;
  @ViewChild('parceiros') parceiros: ElementRef;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly email: EmailService,
    private readonly responsiveService: ResponsiveService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
    private readonly analytics: AnalyticsService) {
    this.responsiveService.$mediaBreakpoint.subscribe(this.verificarDispositivo.bind(this));
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      // Armadilha para robôs: campo invisível; pessoas não preenchem.
      website: ['']
    });
  }

  /** Intervalo mínimo entre dois envios do mesmo navegador. */
  private static readonly INTERVALO_ENVIO_MS = 60_000;
  private static readonly CHAVE_ULTIMO_ENVIO = 'automaxia_contato_ultimo_envio';

  readonly paginasServicos = SERVICOS;

  ionViewDidEnter() {
    this.digitarTexto();
    // Chegou por um link como /#contato (ex.: vindo de uma página de serviço).
    const fragmento = this.router.parseUrl(this.router.url).fragment;
    if (fragmento && ['sobre', 'contato', 'servicos', 'solucoes', 'parceiros'].includes(fragmento)) {
      setTimeout(() => this[fragmento]?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }

  verificarDispositivo(breakpoint: BreakPointType) {
    console.log(breakpoint)
    if (['xs', 'sm'].includes(breakpoint)) {
      this.tipoDispositivo = 'mobile';
      this.slidesPerView = 1;
      this.slidesPerViewSolucoes = 1;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else if (breakpoint === 'md') {
      this.tipoDispositivo = 'tablet';
      this.slidesPerView = 3;
      this.slidesPerViewSolucoes = 2;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else if (breakpoint === 'xxl') {
      this.tipoDispositivo = 'desktop';
      this.slidesPerView = 4;
      this.slidesPerViewSolucoes = 4;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else {
      this.tipoDispositivo = 'desktop';
      this.slidesPerView = 3;
      this.slidesPerViewSolucoes = 3;
      console.log('dispositivo: ', this.tipoDispositivo);
    }
  }

  async digitarTexto() {
    document.getElementById("titulo-site").innerHTML = '';
    const texto = "Simplificar o trabalho |e potencializar a inteligência humana.";
    const velocidade = 80; // Velocidade de digitação em milissegundos
    for (let i = 0; i < texto.length; i++) {
      await new Promise(r => {
        setTimeout(() => {
          document.getElementById("titulo-site").innerHTML += texto.charAt(i) === '|' ? "<br/>" : texto.charAt(i);
          r(true);
        }, velocidade);
      })
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'E-mail enviado com sucesso!',
      duration: 2500,
      position: position,
      color: 'success'
    });

    await toast.present();
  }

  onPhoneNumberChange(event: any) {
    const rawValue = event.target.value;
    const formattedPhoneNumber = formatPhoneNumber(rawValue);
    this.telefone = formattedPhoneNumber;
  }

  async sendEmail() {
    // Validação do formulário ANTES de tentar enviar
    if (!this.emailForm.valid) {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.emailForm.controls).forEach(key => {
        this.emailForm.get(key)?.markAsTouched();
      });

      // Mostrar toast de erro
      const toast = await this.toastController.create({
        message: 'Por favor, preencha todos os campos obrigatórios!',
        duration: 3000,
        position: 'top',
        color: 'danger',
        icon: 'alert-circle'
      });
      await toast.present();
      return;
    }

    // Validações específicas adicionais
    const formData = this.emailForm.value;

    if (!formData.nome || formData.nome.trim().length < 2) {
      this.presentErrorToast('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (!formData.email || !this.isValidEmail(formData.email)) {
      this.presentErrorToast('Por favor, insira um e-mail válido');
      return;
    }

    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
      this.presentErrorToast('Por favor, insira um telefone válido');
      return;
    }

    // Robô preencheu o campo invisível: finge sucesso e não envia nada.
    if (formData.website) {
      this.emailForm.reset();
      const toast = await this.toastController.create({
        message: '✅ Mensagem enviada com sucesso! Entraremos em contato em breve.',
        duration: 4000, position: 'top', color: 'success', icon: 'checkmark-circle'
      });
      await toast.present();
      return;
    }

    // Um envio por minuto por navegador.
    const ultimoEnvio = Number(this.lerUltimoEnvio() || 0);
    if (Date.now() - ultimoEnvio < HomePage.INTERVALO_ENVIO_MS) {
      this.presentErrorToast('Você acabou de enviar uma mensagem. Aguarde um minuto para enviar outra.');
      return;
    }

    try {
      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Enviando mensagem...',
        spinner: 'crescent'
      });
      await loading.present();

      // Dados para envio (com tamanho máximo por campo)
      const dadosCliente = {
        nome: String(formData.nome).trim().slice(0, 120),
        email: String(formData.email).trim().toLowerCase().slice(0, 200),
        telefone: String(formData.telefone).slice(0, 20)
      };

      const assunto = `Contato via site - ${dadosCliente.nome}`;

      // O conteúdo do e-mail é montado pelo template no EmailJS.
      const resultado = await this.email.envioemail(assunto, dadosCliente);

      // Fechar loading
      await loading.dismiss();

      if (resultado.success) {
        // Sucesso - mostrar toast de sucesso
        const toast = await this.toastController.create({
          message: '✅ Mensagem enviada com sucesso! Entraremos em contato em breve.',
          duration: 4000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle'
        });
        await toast.present();

        // Conversão no GA (sem dados pessoais; só envia se houver consentimento)
        this.analytics.evento('generate_lead', { form_name: 'contato' });

        // Limpar formulário apenas em caso de sucesso
        this.emailForm.reset();
        this.gravarUltimoEnvio();
      } else {
        // Erro no envio
        throw new Error('Falha no envio pelo EmailJS');
      }

    } catch (error) {
      // Sem dados pessoais no console.
      console.error('Erro ao enviar o formulário de contato.');

      // Fechar loading se ainda estiver aberto
      const loading = await this.loadingController.getTop();
      if (loading) {
        await loading.dismiss();
      }

      // Mostrar erro para o usuário
      const toast = await this.toastController.create({
        message: '❌ Não foi possível enviar agora. Tente de novo em instantes ou escreva para contato@automaxia.com.br.',
        duration: 5000,
        position: 'top',
        color: 'danger',
        icon: 'alert-circle'
      });
      await toast.present();
    }
  }

  private lerUltimoEnvio(): string | null {
    try { return localStorage.getItem(HomePage.CHAVE_ULTIMO_ENVIO); } catch { return null; }
  }

  private gravarUltimoEnvio(): void {
    try { localStorage.setItem(HomePage.CHAVE_ULTIMO_ENVIO, String(Date.now())); } catch { /* navegação privada */ }
  }

  // Método auxiliar para validar e-mail
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método auxiliar para mostrar toast de erro
  private async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle'
    });
    await toast.present();
  }

  navToLinkedin() {
    window.open('https://www.linkedin.com/company/automaxia/?viewAsMember=true', '_blank');
  }

  navToInstagram() {
    window.open('https://instagram.com/automaxia', '_blank');
  }

  irParaSessao(sessao: string) {
    this.router.navigate([], { fragment: sessao });
    this[sessao].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  servicosInfo = [
    {
      titulo: 'RPA',
      link: '/automacao-de-processos-rpa',
      subTitulo: 'Hiperautomação',
      descricao: 'Nós vamos criar uma revolução para o seu negócio, potencializar a inteligência humana, e deixar o trabalho repetitivo e burocrático para nossos robôs.',
      bgImg: `bg-[url('assets/img/servicos-1.webp')]`
    },
    {
      titulo: 'Processos',
      link: '/automacao-de-processos-rpa',
      subTitulo: 'Descoberta e Mineração de Processos',
      descricao: 'Somos especialistas na identificação e classificação de potenciais processos para automação, com metodologia testada e aprovada no mercado.',
      bgImg: `bg-[url('assets/img/servicos-2.webp')]`
    },
    {
      titulo: 'Dados',
      link: '/dados-bi-e-inteligencia-artificial',
      subTitulo: 'IA, Business intelligence, Pipeline de dados',
      descricao: 'Sem modismos, estamos prontos e com muito conhecimento para elevar o seu negócio com IA com as melhores tecnologias.',
      bgImg: `bg-[url('assets/img/servicos-3.webp')]`
    },
    {
      titulo: 'LGPD',
      link: '/lgpd-e-governanca-de-dados',
      subTitulo: 'Governança, integração e Privacidade (LGPD) dos seus dados.',
      descricao: 'Parte importante de projetos de hiperautomação e de IA, somos especialistas em Governança, integração e enriquecimento de dados, além de cuidar da segurança das suas informações.',
      bgImg: `bg-[url('assets/img/servicos-4.webp')]`
    },
    {
      titulo: 'Observabilidade',
      subTitulo: 'Performance de aplicações e estruturas de AIOPS.',
      descricao: 'Performance é o nosso norte, somos especialistas em observar e direcionar suas aplicações, infraestrutura, para maximizar seu negócio.',
      bgImg: `bg-[url('assets/img/servicos-5.webp')]`
    },
    {
      titulo: 'Primeiro Atendimento IA',
      link: '/atendimento-whatsapp-com-ia',
      subTitulo: 'Chat integrado com WhatsApp Business e IA',
      descricao: 'Automatizamos o primeiro contato com seus clientes usando IA generativa integrada ao WhatsApp e Instagram, realizando triagens, coletas de dados e integrações com seus sistemas internos.',
      bgImg: `bg-[url('assets/img/servicos-6.webp')]`
    },
    {
      titulo: 'Dashboards Generativos',
      link: '/dados-bi-e-inteligencia-artificial',
      subTitulo: 'IA para geração automática de insights',
      descricao: 'Utilizamos IA para gerar gráficos automaticamente e extrair insights dos seus dados, criando dashboards inteligentes que se adaptam às suas necessidades de negócio.',
      bgImg: `bg-[url('assets/img/servicos-7.webp')]`
    },
    {
      titulo: 'CortexAI',
      link: '/agentes-de-ia',
      subTitulo: 'Fazenda de Agentes de IA',
      descricao: 'Ambiente dedicado a agentes de IA que executam tarefas autônomas ou colaborativas em processos de negócios, combinando IA generativa, machine learning e automação para ganho de escala, velocidade e inteligência operacional.',
      bgImg: `bg-[url('assets/img/servicos-8.webp')]`
    },
    {
      titulo: 'DataVibe AI',
      link: '/dados-bi-e-inteligencia-artificial',
      subTitulo: 'Treinamento de Modelos por Qualquer Pessoa',
      descricao: 'Plataforma que democratiza a ciência de dados ao permitir que qualquer pessoa — com ou sem experiência técnica — desenvolva modelos de IA prontos para uso em minutos.',
      bgImg: `bg-[url('assets/img/servicos-9.webp')]`
    }
  ];

  parceirosInfo = [
    {
      nome: 'Python',
      icone: 'python.webp',
    },
    {
      nome: 'Apache Airflow',
      icone: 'apache-airflow.webp',
    },
    {
      nome: 'Microsoft',
      icone: 'microsoft.webp',
    },
    {
      nome: 'H2o AI',
      icone: 'h2oai.webp',
    },
    {
      nome: 'Amazon Cloud Services',
      icone: 'amazon.webp',
    },
    {
      nome: 'OpenAI',
      icone: 'openai.webp',
    },
    {
      nome: 'LangChain',
      icone: 'langchain.webp',
    },
    {
      nome: 'LangGraph',
      icone: 'langgraph.webp',
    },
  ];

  solucoesInfo = [
    {
      titulo: 'Automaxia RPA',
      link: '/automacao-de-processos-rpa',
      subTitulo: 'Plataforma de Hiperautomação',
      descricao: 'Abordagem avançada que envolve a combinação de várias tecnologias de automação, inteligência artificial e ferramentas de processamento de dados para automatizar, otimizar e escalar processos em sua organização.',
      bgImg: `bg-[url('assets/img/produto-1.webp')]`
    },
    {
      titulo: 'Botanalytics (Datalake)',
      link: '/dados-bi-e-inteligencia-artificial',
      subTitulo: 'Módulo de Análise',
      descricao: 'Envolve várias práticas e tecnologias para garantir que os dados coletados e gerados por sua organização sejam efetivamente utilizados para otimizar operações e impulsionar o crescimento do negócio.',
      bgImg: `bg-[url('assets/img/produto-2.webp')]`
    },
    {
      titulo: 'Botfarm',
      link: '/automacao-de-processos-rpa',
      subTitulo: 'Fazenda de robôs',
      descricao: 'Uma maneira poderosa de otimizar operações, reduzir custos e melhorar a experiência do cliente, ao mesmo tempo em que se mantém ágil e adaptável às mudanças nas demandas dos robôs.',
      bgImg: `bg-[url('assets/img/produto-3.webp')]`
    },
    {
      titulo: 'Talkcare.ai',
      link: '/atendimento-whatsapp-com-ia',
      subTitulo: 'Assistente Inteligente de Atendimento',
      descricao: 'Plataforma que integra IA generativa, RPA e mensageria para automatizar o primeiro contato com clientes em canais como WhatsApp e Instagram, realizando triagens, coletas de dados e integrações com sistemas internos para acelerar agendamentos, cadastros e respostas a perguntas frequentes.',
      bgImg: `bg-[url('assets/img/produto-4.webp')]`
    },
    {
      titulo: 'CortexAI',
      link: '/agentes-de-ia',
      subTitulo: 'Fazenda de Agentes de IA',
      descricao: 'Ambiente dedicado à criação, orquestração e operação de múltiplos agentes inteligentes prontos para uso, que executam tarefas autônomas ou colaborativas em processos de negócios, combinando IA generativa, machine learning e automação para ganho de escala, velocidade e inteligência operacional.',
      bgImg: `bg-[url('assets/img/produto-5.webp')]`
    },
    {
      titulo: 'DataVibe AI',
      link: '/dados-bi-e-inteligencia-artificial',
      subTitulo: 'Treinamento de Modelos por Qualquer Pessoa',
      descricao: 'Plataforma que democratiza a ciência de dados ao permitir que qualquer pessoa — com ou sem experiência técnica — desenvolva modelos de IA prontos para uso em minutos. Com interface guiada por IA generativa, o DataVibe conduz todas as etapas do processo analítico, da ingestão de dados à explicabilidade, de forma simples, rápida e poderosa.',
      bgImg: `bg-[url('assets/img/produto-6.webp')]`
    },
  ];

  clientesInfo = [
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'Orthophysio',
      descricao: '"Estou impressionado como meu negócio ganhou escala e está crescendo com os serviços da Automaxia. Surpreendente"'
    },
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'Health4',
      descricao: '"Estamos escalando nosso negócio de uma forma nunca antes vista com serviços de automação robótica e de Governança de Dados da Automaxia, simplesmente foi uma mudança de jogo para nós."'
    },
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'CYTEI',
      descricao: '"Com o apoio da Automaxia, conseguimos automatizar tarefas críticas e ganhar eficiência operacional. Agora, estamos prontos para dar o próximo passo e escalar com inteligência artificial. A parceria tem sido essencial para nossa evolução."'
    }
  ]

}
