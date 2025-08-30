// Mock data for development purposes

export const mockUsers = [
  {
    id: '1',
    username: 'john.smith',
    name: 'Иванов Иван Иванович',
    email: 'john.smith@company.kz',
    canApprove: true,
    canReject: true,
    canEdit: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    username: 'sarah.johnson', 
    name: 'Петрова Анна Сергеевна',
    email: 'sarah.johnson@company.kz',
    canApprove: false,
    canReject: false,
    canEdit: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    username: 'mike.davis',
    name: 'Сидоров Петр Александрович',
    email: 'mike.davis@company.kz',
    canApprove: true,
    canReject: true,
    canEdit: false,
    avatar: 'https://via.placeholder.com/40'
  }
];

export const mockDocuments = [
  {
    id: '1',
    title: 'Заявка на оплату поставщику оборудования',
    description: 'Оплата по договору поставки сельскохозяйственного оборудования',
    documentType: 'payment',
    amount: 2500000,
    currency: 'KZT',
    organization: 'ТОО "КазТех Агро"',
    counterparty: 'ТОО "Поставщик оборудования"',
    contract: 'Д-001/2024',
    uploadDate: '2024-10-15',
    lastModified: '2024-10-20',
    uploadedBy: mockUsers[1],
    attachments: [],
    status: 'on_approving',
    routeSteps: [],
    date: '15.10.2024 10:30:00',
    author: 'Петрова Анна Сергеевна',
    responsible: 'Иванов Иван Иванович',
    comment: 'Заявка на оплату поставщику оборудования'
  },
  {
    id: '2',
    title: 'Служебная записка о закупке удобрений',
    description: 'Обоснование необходимости закупки минеральных удобрений для посевной кампании',
    documentType: 'memo',
    organization: 'ТОО "КазТех Агро"',
    uploadDate: '2024-09-22',
    lastModified: '2024-09-22',
    uploadedBy: mockUsers[0],
    attachments: [],
    status: 'approved',
    amount: 0,
    currency: 'KZT',
    counterparty: '',
    contract: '',
    date: '22.09.2024 14:15:00',
    author: 'Иванов Иван Иванович',
    responsible: 'Петрова Анна Сергеевна',
    comment: 'Служебная записка о закупке удобрений'
  },
  {
    id: '3',
    title: 'Счет-фактура на агрохимикаты',
    description: 'Счет на поставку средств защиты растений',
    documentType: 'invoice',
    amount: 450000,
    currency: 'KZT',
    organization: 'АО "Агротехнологии КЗ"',
    counterparty: 'АО "Агрохим Сервис"',
    uploadDate: '2024-11-01',
    lastModified: '2024-11-05',
    uploadedBy: mockUsers[1],
    attachments: [],
    status: 'declined',
    contract: '',
    date: '01.11.2024 09:20:00',
    author: 'Петрова Анна Сергеевна',
    responsible: 'Сидоров Петр Александрович',
    comment: 'Счет-фактура на агрохимикаты'
  }
];

export default {
  mockUsers,
  mockDocuments
};