/*
  Видео из игры (YouTube). id — код ролика из ссылки youtube.com/watch?v=КОД.
  Ролики сторонних авторов: на сайт встраивается их плеер, сами видео остаются на YouTube.
  Чтобы добавить свой ролик, допиши строку в нужную группу. author можно оставить пустым.
  Группы: frigate — вкладка «Видео из игры» у карты Фрегата, emperor — раздел «Император»,
  general — обзор в разделе «Что нового».
*/
window.FT = window.FT || {};

FT.videos = {
  frigate: [
    { id: 'fw-dXQoGVDc', author: 'Arekkz Gaming', title: 'ARC Raiders Frigate Guide — How To Get Amplification Modules, Best Loot & Tips', note: 'Гайд по Фрегату: модули, лучший лут, советы' },
    { id: 'vIJx3EnJAyc', author: 'Diggy', title: 'A Basic Guide On How To Get Started On The NEW Frigate Puzzle In ARC Raiders', note: 'С чего начать головоломку на Фрегате' },
    { id: 'iWW9TH71u98', author: '', title: 'How To Get On The Frigate in Arc Raiders', note: 'Как забраться на Фрегат' },
    { id: '_WAUtV8jNUA', author: '', title: 'How to do the NEW Frigate Event in Arc Raiders', note: 'Как пройти событие Фрегата' },
    { id: 'aYfTc-eNjbQ', author: 'Millzaa', title: "I Boarded ARC Raiders' Frigate... There's HIDDEN Cargo Inside", note: 'Посадка на Фрегат и скрытый трюм' },
    { id: '9fSuXXwQF1s', author: 'Time Sausages Gaming Channel', title: 'My First Ever Frigate Assault Arc Raiders! (Terrifying)', note: 'Первый штурм Фрегата, геймплей' }
  ],
  emperor: [
    { id: 'xlSFxL1koY8', author: 'Glitch Unlimited', title: 'ARC Raiders Emperor — Ultimate Guide, Tips & Tricks! (Frozen Trail)', note: 'Гайд по Императору и советы' },
    { id: '14LBDnMcq00', author: 'Incredilags', title: 'Arc Raiders Emperor Gateway Key Guide: Blueprint, Boss Fight, and Emperor Loot Rewards', note: 'Чертёж ключа, бой внутри и награды' },
    { id: 'arcAL67AU9Y', author: '', title: 'Opening the new Emperor Gateway Conduit in ARC Raiders! (First look)', note: 'Открываем дверь ключом, первый заход' },
    { id: 'feBdjWqob1g', author: '', title: 'Raiding the ARC Emperor Is Not What We Expected...', note: 'Рейд внутри Императора' }
  ],
  general: [
    { id: 'RBZVHF9aRtI', author: 'Glitch Unlimited', title: 'Arc Raiders Frozen Trail — Ultimate Guide, Tips & Tricks!', note: 'Обзор обновления и советы' }
  ]
};
