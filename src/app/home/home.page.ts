import {Component, ElementRef, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../shared/services/email.service';
import { ToastController } from '@ionic/angular';
import {BreakPointType, ResponsiveService} from "../../shared/services/responsive.service";

function formatPhoneNumber(phoneNumber:any) {
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
})
export class HomePage {

  tipoDispositivo = 'mobile';
  emailForm: FormGroup;
  telefone = '';
  nome = ''
  slidesPerView = 5;
  @ViewChild('home') home: ElementRef;
  @ViewChild('sobre') sobre: ElementRef;
  @ViewChild('contato') contato: ElementRef;
  @ViewChild('servicos') servicos: ElementRef;
  @ViewChild('produtos') produtos: ElementRef;
  @ViewChild('parceiros') parceiros: ElementRef;


  constructor(private router: Router,
              private fb: FormBuilder,
              private email: EmailService,
              private responsiveService: ResponsiveService,
              private toastController: ToastController) {
    this.responsiveService.$mediaBreakpoint.subscribe(this.verificarDispositivo.bind(this));
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      telefone: ['', Validators.required]
    });
  }

  ionViewDidEnter() {
    this.digitarTexto();
  }

  verificarDispositivo(breakpoint: BreakPointType) {
    console.log(breakpoint)
    if (['xs', 'sm'].includes(breakpoint)) {
      this.tipoDispositivo = 'mobile';
      this.slidesPerView = 1;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else if (breakpoint === 'md') {
      this.tipoDispositivo = 'tablet';
      this.slidesPerView = 3;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else if (breakpoint === 'xxl') {
      this.tipoDispositivo = 'desktop';
      this.slidesPerView = 4;
      console.log('dispositivo: ', this.tipoDispositivo);
    } else {
      this.tipoDispositivo = 'desktop';
      this.slidesPerView = 3;
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

  sendEmail(){
    if( this.emailForm.valid ) {
      console.log(this.emailForm.value);
      const assunto = 'Contato via site';
      const corpo = 'Nome: '+this.emailForm.value.nome+'<br>' +
          'Telefone: '+this.emailForm.value.telefone;

      this.email.envioemail(assunto, corpo, this.emailForm.value.email)
    }
    this.presentToast('top');
    this.emailForm.reset();
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
      subTitulo: 'Hiperautomação',
      descricao: 'Nós vamos criar uma revolução para o seu negócio, potencializar a inteligência humana, e deixar o trabalho repetitivo e burocrático para nossos robôs.',
      bgImg: `bg-[url('assets/img/servicos-1.png')]`
    },
    {
      titulo: 'Processos',
      subTitulo: 'Descoberta e Mineração de Processos',
      descricao: 'Somos especialistas na identificação e classificação de potenciais processos para automação, com metodologia testada e aprovada no mercado.',
      bgImg: `bg-[url('assets/img/servicos-2.png')]`
    },
    {
      titulo: 'Dados',
      subTitulo: 'IA, Business intelligence, Pipeline de dados',
      descricao: 'Sem modismos, estamos prontos e com muito conhecimento para elevar o seu negócio com IA com as melhores tecnologias.',
      bgImg: `bg-[url('assets/img/servicos-3.png')]`
    },
    {
      titulo: 'LGPD',
      subTitulo: 'Governança, integração e Privacidade (LGPD) dos seus dados.',
      descricao: 'Parte importante de projetos de hiperautomação e de IA, somos especialistas em Governança, integração e enriquecimento de dados, além de cuidar da segurança das suas informações.',
      bgImg: `bg-[url('assets/img/servicos-4.png')]`
    },
    {
      titulo: 'Observabilidade',
      subTitulo: 'Performance de aplicações e estruturas de AIOPS.',
      descricao: 'Performance é o nosso norte, somos especialistas em observar e direcionar suas aplicações, infraestrutura, para maximizar seu negócio.',
      bgImg: `bg-[url('assets/img/servicos-5.png')]`
    }
  ];
  parceirosInfo = [
    {
      nome: 'Python',
      icone: 'python.png',
    },
    {
      nome: 'Apache Airflow',
      icone: 'apache-airflow.png',
    },
    {
      nome: 'Microsoft',
      icone: 'microsoft.png',
    },
    {
      nome: 'H2o AI',
      icone: 'h2oai.png',
    },
    {
      nome: 'Amazon Cloud Services',
      icone: 'amazon.png',
    },
  ];
  produtosInfo = [
    {
      titulo: 'Automaxia RPA',
      subTitulo: 'Plataforma de Hiperautomação',
      descricao: 'Abordagem avançada que envolve a combinação de várias tecnologias de automação, inteligência artificial e ferramentas de processamento de dados para automatizar, otimizar e escalar processos em sua organização.',
      bgImg: `bg-[url('assets/img/produto-1.png')]`
    },
    {
      titulo: 'Botanalytics (Datalake)',
      subTitulo: 'Modulo de Analise',
      descricao: 'Envolve várias práticas e tecnologias para garantir que os dados coletados e gerados por sua organização sejam efetivamente utilizados para otimizar operações e impulsionar o crescimento do negócio.',
      bgImg: `bg-[url('assets/img/produto-2.png')]`
    },
    {
      titulo: 'Botfarm',
      subTitulo: ' Fazenda de robôs',
      descricao: 'Uma maneira poderosa de otimizar operações, reduzir custos e melhorar a experiência do cliente, ao mesmo tempo em que se mantém ágil e adaptável às mudanças nas demandas dos robôs.',
      bgImg: `bg-[url('assets/img/produto-3.png')]`
    },
  ];
  clientesInfo = [
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'Orthophysio',
      descricao: '“Estou impressionado como meu negócio ganhou escala e está crescendo com os serviços da Automaxia. Surpreendente”'
    },
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'Health4',
      descricao: '“Estamos escalando nosso negócio de uma forma nunca antes vista com serviços de automação robótica e de Governança de Dados da Automaxia, simplesmente foi uma mudança de jogo para nós.”'
    },
    {
      img: 'assets/img/user-icon.svg',
      bgImg: `bg-[url('assets/img/user-icon.svg')]`,
      titulo: 'Azi Contabilidade',
      descricao: '“Estamos conseguindo crescer em operação e diminuir os custos ao mesmo tempo com todo o processo de automação, o próximo passo é usar IA para escalar ainda mais nosso negócio. Sucesso absoluto com a Automaxia nos apoiando.”'
    }
  ]

}
