// Russian translations for all custom messages in the application
const messages = {
  // DocumentDetail.jsx messages
  'Failed to load document details': 'Не удалось загрузить детали документа',
  'Unknown error': 'Неизвестная ошибка',
  'No authentication token found': 'Токен аутентификации не найден',
  'Failed to fetch document routes': 'Не удалось получить маршруты документа',
  'Failed to fetch route titles': 'Не удалось получить названия маршрутов',
  'Failed to fetch users list': 'Не удалось получить список пользователей',
  'Document declined successfully': 'Документ успешно отклонен',
  'Failed to decline document': 'Не удалось отклонить документ',
  'Document is not in a state that allows sending to route': 'Документ не находится в состоянии, которое позволяет отправить его на маршрут',
  'Please fill in the route steps': 'Пожалуйста, заполните маршрутные шаги',
  'Please select users for all steps': 'Пожалуйста, выберите пользователей для всех шагов',
  'Document sent to route successfully': 'Документ успешно отправлен на маршрут',
  'Failed to send document to route': 'Не удалось отправить документ на маршрут',
  'Failed to get signing template for approve': 'Не удалось получить шаблон для подписания',
  'Request timeout': 'Тайм-аут запроса',
  'Failed to approve document': 'Не удалось утвердить документ',
  'Document approved successfully': 'Документ успешно утвержден',
  'Error checking access to approve/decline': 'Ошибка проверки доступа для утверждения/отклонения',
  'Error refetching document routes': 'Ошибка повторной загрузки маршрутов документа',
  'Failed to delete document': 'Не удалось удалить документ',
  'Document deleted successfully': 'Документ успешно удален',
  
  // DocumentEdit.jsx messages
  'Failed to update document': 'Не удалось обновить документ',
  'Error updating memo': 'Ошибка обновления служебной записки',
  
  // ExpenditureForm.jsx messages
  'Please select an organization': 'Пожалуйста, выберите организацию',
  'Please select a counterparty': 'Пожалуйста, выберите контрагента',
  'Please select a CFO': 'Пожалуйста, выберите ЦФО',
  'Please select a project': 'Пожалуйста, выберите проект',
  'Please select a DDS article': 'Пожалуйста, выберите статью ДДС',
  'Please select a budget article': 'Пожалуйста, выберите статью бюджета',
  'Please select a contract': 'Пожалуйста, выберите договор',
  'Error creating expenditure document': 'Ошибка создания документа расходов',
  'Expenditure document created successfully with files!': 'Документ расходов успешно создан с файлами!',
  'Expenditure document created, but there were issues uploading files': 'Документ расходов создан, но возникли проблемы с загрузкой файлов',
  'Expenditure document created successfully!': 'Документ расходов успешно создан!',
  'Unknown error when creating document': 'Неизвестная ошибка при создании документа',
  
  // MemoForm.jsx messages
  'Please select a document type': 'Пожалуйста, выберите тип документа',
  'Please enter the appeal text': 'Пожалуйста, введите текст обращения',
  'Error creating memo': 'Ошибка создания служебной записки',
  'Memo created successfully with files!': 'Служебная записка успешно создана с файлами!',
  'Memo created, but there were issues uploading files': 'Служебная записка создана, но возникли проблемы с загрузкой файлов',
  'Memo created successfully!': 'Служебная записка успешно создана!',
  
  // Login.jsx messages
  'Invalid username or password': 'Неверное имя пользователя или пароль',
  'Error trying to login. Please try again.': 'Ошибка при попытке входа. Пожалуйста, попробуйте еще раз.',
  
  // Common messages
  'Clicked button': 'Нажата кнопка',
  'Failed to save signed document': 'Не удалось сохранить подписанный документ'
};

// Function to get translated message
export const t = (key) => {
  return messages[key] || key;
};

// Function to get translated message with variables
export const tWithVars = (key, vars) => {
  let message = messages[key] || key;
  if (vars) {
    Object.keys(vars).forEach(varKey => {
      message = message.replace(`{{${varKey}}}`, vars[varKey]);
    });
  }
  return message;
};

export default messages;