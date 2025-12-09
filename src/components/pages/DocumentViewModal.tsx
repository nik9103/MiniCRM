import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

type DocumentType = 'contract' | 'consent' | 'medical' | 'insurance' | 'application';
type DocumentStatus = 'signed' | 'unsigned';

interface Document {
  id: number;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  date: string;
  size: number;
  athleteId: number;
  athleteName: string;
  competitionId: number;
  competitionName: string;
  fileUrl?: string;
  scanFile?: File | null;
}

interface DocumentViewModalProps {
  open: boolean;
  document: Document | null;
  onClose: () => void;
}

export function DocumentViewModal({ open, document: doc, onClose }: DocumentViewModalProps) {
  if (!doc) return null;

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      contract: 'Договор',
      consent: 'Согласие на обработку персональных данных',
      medical: 'Медицинская справка',
      insurance: 'Страховой полис',
      application: 'Заявление на участие',
    };
    return labels[type];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[95vh] flex flex-col p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Просмотр документа</DialogTitle>
        
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="h-full min-h-[600px] flex items-center justify-center p-6">
            {doc.status === 'unsigned' ? (
              // Шаблон документа (не подписан)
              <div className="bg-white rounded-lg shadow-lg w-full max-w-[210mm] min-h-[297mm] p-12">
                <div className="space-y-6">
                  <div className="text-center border-b pb-6">
                    <h3 className="text-2xl mb-2">{getDocumentTypeLabel(doc.type)}</h3>
                    <p className="text-sm text-gray-600">Шаблон документа</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-48">Соревнование:</span>
                      <span className="text-sm">{doc.competitionName}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-48">Спортсмен:</span>
                      <span className="text-sm">{doc.athleteName}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    {doc.type === 'contract' && (
                      <>
                        <p className="text-sm">Настоящий договор заключен между организатором соревнований и спортсменом о нижеследующем:</p>
                        <div className="space-y-3">
                          <p className="text-sm"><strong>1. ПРЕДМЕТ ДОГОВОРА</strong></p>
                          <p className="text-sm">1.1. Спортсмен обязуется принять участие в соревновании в соответствии с правилами и регламентом.</p>
                          <p className="text-sm">1.2. Организатор обязуется обеспечить проведение соревнования согласно установленным стандартам.</p>
                          
                          <p className="text-sm"><strong>2. ПРАВА И ОБЯЗАННОСТИ СТОРОН</strong></p>
                          <p className="text-sm">2.1. Спортсмен имеет право на получение информации о ходе соревнования.</p>
                          <p className="text-sm">2.2. Спортсмен обязуется соблюдать правила соревнования и спортивную этику.</p>
                        </div>
                      </>
                    )}
                    
                    {doc.type === 'consent' && (
                      <>
                        <p className="text-sm">Я, нижеподписавшийся(аяся), даю свое согласие на обработку персональных данных:</p>
                        <div className="space-y-2">
                          <p className="text-sm">• Фамилия, имя, отчество</p>
                          <p className="text-sm">• Дата рождения</p>
                          <p className="text-sm">• Контактные данные (телефон, email)</p>
                          <p className="text-sm">• Спортивные достижения и результаты</p>
                        </div>
                        <p className="text-sm mt-4">Согласие действует с момента подписания и до момента отзыва в письменной форме.</p>
                      </>
                    )}
                    
                    {doc.type === 'medical' && (
                      <>
                        <p className="text-sm">Медицинская справка о допуске к занятиям спортом и участию в соревнованиях.</p>
                        <div className="space-y-3 mt-4">
                          <div className="border rounded p-3">
                            <p className="text-sm text-gray-600">Ф.И.О. спортсмена:</p>
                            <p className="text-sm border-b border-dotted mt-1">{doc.athleteName}</p>
                          </div>
                          <div className="border rounded p-3">
                            <p className="text-sm text-gray-600">Заключение врача:</p>
                            <p className="text-sm mt-2">Осмотрен(а). Противопоказаний к занятиям спортом не выявлено. Допущен(а) к участию в соревнованиях.</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {doc.type === 'insurance' && (
                      <>
                        <p className="text-sm">Страховой полис спортсмена на период участия в соревновании.</p>
                        <div className="space-y-3 mt-4">
                          <div className="flex">
                            <span className="text-sm text-gray-600 w-48">Номер полиса:</span>
                            <span className="text-sm">СП-{Math.floor(Math.random() * 1000000)}</span>
                          </div>
                          <div className="flex">
                            <span className="text-sm text-gray-600 w-48">Страхователь:</span>
                            <span className="text-sm">{doc.athleteName}</span>
                          </div>
                          <div className="flex">
                            <span className="text-sm text-gray-600 w-48">Страховая сумма:</span>
                            <span className="text-sm">500 000 руб.</span>
                          </div>
                          <div className="flex">
                            <span className="text-sm text-gray-600 w-48">Период страхования:</span>
                            <span className="text-sm">На период соревнования</span>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {doc.type === 'application' && (
                      <>
                        <p className="text-sm">Заявление на участие в соревновании.</p>
                        <div className="space-y-4 mt-4">
                          <p className="text-sm">Прошу допустить меня к участию в соревновании <strong>{doc.competitionName}</strong>.</p>
                          <div className="space-y-2">
                            <p className="text-sm">С правилами и регламентом соревнования ознакомлен(а) и согласен(на).</p>
                            <p className="text-sm">Обязуюсь соблюдать правила спортивной этики и дисциплины.</p>
                            <p className="text-sm">Об ответственности за предоставление недостоверных сведений предупрежден(а).</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-12 border-t mt-12 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-600">Дата</p>
                        <div className="border-b border-gray-400 w-32 mt-2"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Подпись спортсмена</p>
                        <div className="border-b border-gray-400 w-48 mt-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // PDF просмотр (подписан)
              <div className="bg-white rounded-lg shadow-lg w-full max-w-[210mm] min-h-[800px] overflow-hidden">
                <div className="bg-gray-200 p-4 border-b flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {doc.name}.pdf
                  </div>
                  <div className="text-sm text-gray-600">
                    {doc.size.toFixed(2)} МБ
                  </div>
                </div>
                
                <div className="bg-white p-12 min-h-[700px]">
                  <div className="space-y-6">
                    <div className="text-center border-b pb-6">
                      <h3 className="text-2xl mb-2">{getDocumentTypeLabel(doc.type)}</h3>
                      <div className="text-xs text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full mt-2">
                        ✓ Документ подписан
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-48">Соревнование:</span>
                        <span className="text-sm">{doc.competitionName}</span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-48">Спортсмен:</span>
                        <span className="text-sm">{doc.athleteName}</span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-48">Дата подписания:</span>
                        <span className="text-sm">{new Intl.DateTimeFormat('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).format(new Date(doc.date))}</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      {doc.type === 'contract' && (
                        <>
                          <p className="text-sm">Настоящий договор заключен между организатором соревнований и спортсменом о нижеследующем:</p>
                          <div className="space-y-3">
                            <p className="text-sm"><strong>1. ПРЕДМЕТ ДОГОВОРА</strong></p>
                            <p className="text-sm">1.1. Спортсмен обязуется принять участие в соревновании в соответствии с правилами и регламентом.</p>
                            <p className="text-sm">1.2. Организатор обязуется обеспечить проведение соревнования согласно установленным стандартам.</p>
                            
                            <p className="text-sm"><strong>2. ПРАВА И ОБЯЗАННОСТИ СТОРОН</strong></p>
                            <p className="text-sm">2.1. Спортсмен имеет право на получение информации о ходе соревнования.</p>
                            <p className="text-sm">2.2. Спортсмен обязуется соблюдать правила соревнования и спортивную этику.</p>
                          </div>
                        </>
                      )}
                      
                      {doc.type === 'consent' && (
                        <>
                          <p className="text-sm">Я, нижеподписавшийся(аяся), даю свое согласие на обработку персональных данных:</p>
                          <div className="space-y-2">
                            <p className="text-sm">• Фамилия, имя, отчество</p>
                            <p className="text-sm">• Дата рождения</p>
                            <p className="text-sm">• Контактные данные (телефон, email)</p>
                            <p className="text-sm">• Спортивные достижения и результаты</p>
                          </div>
                          <p className="text-sm mt-4">Согласие действует с момента подписания и до момента отзыва в письменной форме.</p>
                        </>
                      )}
                      
                      {doc.type === 'medical' && (
                        <>
                          <p className="text-sm">Медицинская справка о допуске к занятиям спортом и участию в соревнованиях.</p>
                          <div className="space-y-3 mt-4">
                            <div className="border rounded p-3">
                              <p className="text-sm text-gray-600">Ф.И.О. спортсмена:</p>
                              <p className="text-sm border-b border-dotted mt-1">{doc.athleteName}</p>
                            </div>
                            <div className="border rounded p-3">
                              <p className="text-sm text-gray-600">Заключение врача:</p>
                              <p className="text-sm mt-2">Осмотрен(а). Противопоказаний к занятиям спортом не выявлено. Допущен(а) к участию в соревнованиях.</p>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {doc.type === 'insurance' && (
                        <>
                          <p className="text-sm">Страховой полис спортсмена на период участия в соревновании.</p>
                          <div className="space-y-3 mt-4">
                            <div className="flex">
                              <span className="text-sm text-gray-600 w-48">Номер полиса:</span>
                              <span className="text-sm">СП-{Math.floor(Math.random() * 1000000)}</span>
                            </div>
                            <div className="flex">
                              <span className="text-sm text-gray-600 w-48">Страхователь:</span>
                              <span className="text-sm">{doc.athleteName}</span>
                            </div>
                            <div className="flex">
                              <span className="text-sm text-gray-600 w-48">Страховая сумма:</span>
                              <span className="text-sm">500 000 руб.</span>
                            </div>
                            <div className="flex">
                              <span className="text-sm text-gray-600 w-48">Период страхования:</span>
                              <span className="text-sm">На период соревнования</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {doc.type === 'application' && (
                        <>
                          <p className="text-sm">Заявление на участие в соревновании.</p>
                          <div className="space-y-4 mt-4">
                            <p className="text-sm">Прошу допустить меня к участию в соревновании <strong>{doc.competitionName}</strong>.</p>
                            <div className="space-y-2">
                              <p className="text-sm">С правилами и регламентом соревнования ознакомлен(а) и согласен(на).</p>
                              <p className="text-sm">Обязуюсь соблюдать правила спортивной этики и дисциплины.</p>
                              <p className="text-sm">Об ответственности за предоставление недостоверных сведений предупрежден(а).</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-12 border-t mt-12">
                      <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700">✓</span>
                          </div>
                          <div>
                            <p className="text-sm">Подписано</p>
                            <p className="text-sm text-gray-600">{doc.athleteName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Дата подписания</p>
                          <p className="text-sm">{new Intl.DateTimeFormat('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }).format(new Date(doc.date))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
          <div className="flex items-center justify-between w-full gap-4">
            {doc.status === 'signed' && (
              <Button
                onClick={() => {
                  toast.success('Скачивание документа...');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className={doc.status === 'signed' ? '' : 'ml-auto'}>
              Закрыть
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
