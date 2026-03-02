import { useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { useList, useNavigation } from '@refinedev/core';
import { Select, Card, DatePicker, Typography, Tag, Space, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

// Business hours 08:00 - 20:00
const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

interface Booking {
  id: string;
  printerId: string;
  userId: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export const BookingCalendar = () => {
  const [selectedPrinter, setSelectedPrinter] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { create } = useNavigation();

  const { selectProps: printerSelectProps } = useSelect({
    resource: 'printers',
    optionLabel: 'name',
    optionValue: 'id',
  });

  const { data: bookingsData } = useList<Booking>({
    resource: 'bookings',
    filters: [
      { field: 'printerId', operator: 'eq', value: selectedPrinter },
    ],
    queryOptions: {
      enabled: !!selectedPrinter,
    },
  });

  // Filter bookings for selected date on the client side
  const bookings = (bookingsData?.data ?? []).filter((b) => {
    const bStart = dayjs(b.startTime);
    return bStart.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
  });

  const isSlotBooked = (hour: number): Booking | undefined => {
    const slotStart = selectedDate.hour(hour).minute(0).second(0);
    const slotEnd = slotStart.add(1, 'hour');

    return bookings.find((b) => {
      const bStart = dayjs(b.startTime);
      const bEnd = dayjs(b.endTime);
      return bStart.isBefore(slotEnd) && bEnd.isAfter(slotStart);
    });
  };

  const handleSlotClick = (hour: number) => {
    const startTime = selectedDate.hour(hour).minute(0).second(0).toISOString();
    const endTime = selectedDate.hour(hour + 1).minute(0).second(0).toISOString();
    create('bookings', 'push', {
      printerId: selectedPrinter,
      startTime,
      endTime,
    });
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space wrap>
          <Select
            {...printerSelectProps}
            placeholder="Seleziona stampante"
            style={{ minWidth: 200 }}
            value={selectedPrinter as unknown as undefined}
            onChange={(value) => setSelectedPrinter(String(value))}
          />
          <Space>
            <Button
              icon={<LeftOutlined />}
              size="small"
              onClick={() => setSelectedDate((d) => d.subtract(1, 'day'))}
            />
            <DatePicker
              value={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              format="DD/MM/YYYY"
              allowClear={false}
            />
            <Button
              icon={<RightOutlined />}
              size="small"
              onClick={() => setSelectedDate((d) => d.add(1, 'day'))}
            />
          </Space>
        </Space>

        <div>
          {SLOT_HOURS.map((hour) => {
            const booking = selectedPrinter ? isSlotBooked(hour) : undefined;
            const label = `${String(hour).padStart(2, '0')}:00`;
            const isPast = selectedDate.hour(hour).isBefore(dayjs());

            return (
              <div
                key={hour}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f0',
                  padding: '8px 0',
                  minHeight: 40,
                }}
              >
                <Text
                  strong
                  style={{ width: 60, flexShrink: 0 }}
                >
                  {label}
                </Text>
                <div style={{ flex: 1 }}>
                  {booking ? (
                    <Tag color="red" style={{ margin: 0 }}>
                      Occupato{booking.notes ? ` — ${booking.notes}` : ''}
                    </Tag>
                  ) : selectedPrinter && !isPast ? (
                    <Tag
                      color="green"
                      style={{ cursor: 'pointer', margin: 0 }}
                      onClick={() => handleSlotClick(hour)}
                    >
                      Libero — clicca per prenotare
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ margin: 0 }}>
                      {isPast ? 'Passato' : '—'}
                    </Tag>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Space>
    </Card>
  );
};
