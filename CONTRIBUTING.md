# Instruções sobre novas implementações e realização de tarefas

Para começar, as tarefas e/ou problemas a serem corrigidos serão cadastrados como issues dentro do projeto no GitHub. Isso facilita a criação de branchs (para deixar o fluxo de trabalho mais organizado e minimizar conflitos), a análise da execução etc. Aqui vai um passo a passo simples de como desenvolver usando as Issues de Pull requests.

## MUITO IMPORTANTE

**Nunca** faça alterações diretamente na `main`! Se julgar desnecessário criar uma issue ou tarefa separada para a alteração podemos abrir exceções. Mas, via de regra, não altere nada diretamente na `main`. 

## Primeiro passo

Primeiro você deve acessar as tarefas na aba de issues do GitHub, e localizar a(s) tarefa(s) que estiver(em) atribuída(s) a você. Clique sobre a issue e você será direcionado para a página de detalhes da Issue.

Dentro desta tela, à direita, localize o botão **Development > Create a branch for this issue or link a pull request** (em português: **Criar uma ramificação para este projeto ou link um pull request**).

No modal que se abrirá, mantenha o nome da branch (ou do ramo) como está, o repositório também, e a branch principal. Em **What's next?** ou **O que vem depois?** selecione a primeira opção: Checkcout locally. Clique em criar branch.

## Segundo passo

Acesse seu terminal e navegue até a pasta do seu projeto:

```sh
cd /caminho/para/o/projeto
```

Dentro do projeto, certifique-se de estar na branch `main` e execute:

```sh
git pull
```

Esse comando puxa as alterações do repositório remoto para o repositório local (na sua máquina), e evita conflitos após a conclusão da tarefa.

Depois, execute, um de cada vez, os comandos abaixo:

```sh
# Atualiza as branchs no remoto com o local
git fetch origin

# Muda da branch main para a branch criada lá na issue
git switch nome-da-branch
```

Tudo pronto para começar o desenvolvimento!

## Terceiro passo

Uma vez concluída a tarefa, é hora de enviá-la para o repositório remoto a fim de criar um pull request e, após avaliação, a branch ser mesclada com a branch principal (main).

Para isso, certifique-se de que todas as alterações que você fez foram adicionadas, commitadas e verificadas:

```sh
git add .
git commit -m "mensagem do commit"
git status # deve retornar o texto "nothing to commit, working tree clean"
```

Todas as alterações salvas, faça um `git push` da sua branch atual para o repositório remoto:

```sh
git push -u origin nome-da-branch
```

Assim que você subir a branch e ela for concluída com sucesso, acesse a página principal do repositório e localize uma caixa de texto amarela contendo um botão **Compare & pull request** (se não localizar no topo da página, atualize-a).

Clique nesse botão, preencha a descrição do pull request como preferir, e crie o pull request.