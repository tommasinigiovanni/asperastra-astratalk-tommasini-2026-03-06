import { useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { useList, useNavigation } from '@refinedev/core';
import {
  Select,
  Card,
  DatePicker,
  Typography,
  Space,
  Button,
  Tooltip,
  Flex,
  Badge,
  theme,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i,
);

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
  const { token } = theme.useToken();

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
    const startTime = selectedDate
      .hour(hour)
      .minute(0)
      .second(0)
      .toISOString();
    const endTime = selectedDate
      .hour(hour + 1)
      .minute(0)
      .second(0)
      .toISOString();
    create('bookings', 'push', {
      printerId: selectedPrinter,
      startTime,
      endTime,
    });
  };

  const isToday = selectedDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

  // Stats
  const totalSlots = SLOT_HOURS.length;
  const bookedSlots = selectedPrinter
    ? SLOT_HOURS.filter((h) => isSlotBooked(h)).length
    : 0;
  const pastSlots = selectedPrinter
    ? SLOT_HOURS.filter(
        (h) => !isSlotBooked(h) && selectedDate.hour(h).isBefore(dayjs()),
      ).length
    : 0;
  const freeSlots = selectedPrinter ? totalSlots - bookedSlots - pastSlots : 0;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* Header toolbar */}
      <Card size="small">
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Select
            {...printerSelectProps}
            placeholder="Seleziona stampante"
            style={{ minWidth: 240 }}
            size="large"
            value={selectedPrinter as unknown as undefined}
            onChange={(value) => setSelectedPrinter(String(value))}
            suffixIcon={<CalendarOutlined />}
          />

          <Space size="small">
            <Button
              icon={<LeftOutlined />}
              onClick={() => setSelectedDate((d) => d.subtract(1, 'day'))}
            />
            <DatePicker
              value={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              format="DD/MM/YYYY"
              allowClear={false}
              style={{ width: 150 }}
            />
            <Button
              icon={<RightOutlined />}
              onClick={() => setSelectedDate((d) => d.add(1, 'day'))}
            />
            {!isToday && (
              <Button type="link" onClick={() => setSelectedDate(dayjs())}>
                Oggi
              </Button>
            )}
          </Space>
        </Flex>
      </Card>

      {/* Stats */}
      {selectedPrinter && (
        <Flex gap={16} wrap="wrap">
          <Badge
            color={token.colorSuccess}
            text={
              <Text type="secondary">
                <CheckCircleOutlined /> {freeSlots} liberi
              </Text>
            }
          />
          <Badge
            color={token.colorError}
            text={
              <Text type="secondary">
                <StopOutlined /> {bookedSlots} occupati
              </Text>
            }
          />
          <Badge
            color={token.colorTextDisabled}
            text={
              <Text type="secondary">
                <ClockCircleOutlined /> {pastSlots} passati
              </Text>
            }
          />
        </Flex>
      )}

      {/* Slot grid */}
      {!selectedPrinter ? (
        <Card>
          <Flex
            justify="center"
            align="center"
            style={{ padding: '60px 0' }}
          >
            <Text type="secondary" style={{ fontSize: 16 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Seleziona una stampante per vedere la disponibilità
            </Text>
          </Flex>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 8,
          }}
        >
          {SLOT_HOURS.map((hour) => {
            const booking = isSlotBooked(hour);
            const label = `${String(hour).padStart(2, '0')}:00`;
            const endLabel = `${String(hour + 1).padStart(2, '0')}:00`;
            const isPast =
              !booking && selectedDate.hour(hour).isBefore(dayjs());

            if (booking) {
              return (
                <Tooltip
                  key={hour}
                  title={booking.notes || 'Prenotazione senza note'}
                >
                  <Card
                    size="small"
                    style={{
                      borderLeft: `4px solid ${token.colorError}`,
                      background: token.colorErrorBg,
                      cursor: 'default',
                    }}
                    styles={{ body: { padding: '10px 14px' } }}
                  >
                    <Flex justify="space-between" align="center">
                      <Space>
                        <Text
                          strong
                          style={{ color: token.colorError, fontSize: 15 }}
                        >
                          {label}
                        </Text>
                        <Text type="secondary">– {endLabel}</Text>
                      </Space>
                      <StopOutlined style={{ color: token.colorError }} />
                    </Flex>
                    <Text
                      ellipsis
                      style={{
                        fontSize: 12,
                        color: token.colorTextSecondary,
                        marginTop: 2,
                        display: 'block',
                      }}
                    >
                      {booking.notes || 'Occupato'}
                    </Text>
                  </Card>
                </Tooltip>
              );
            }

            if (isPast) {
              return (
                <Card
                  key={hour}
                  size="small"
                  style={{
                    borderLeft: `4px solid ${token.colorBorderSecondary}`,
                    background: token.colorFillQuaternary,
                    opacity: 0.6,
                  }}
                  styles={{ body: { padding: '10px 14px' } }}
                >
                  <Flex justify="space-between" align="center">
                    <Space>
                      <Text style={{ fontSize: 15 }}>{label}</Text>
                      <Text type="secondary">– {endLabel}</Text>
                    </Space>
                    <ClockCircleOutlined
                      style={{ color: token.colorTextDisabled }}
                    />
                  </Flex>
                  <Text
                    style={{
                      fontSize: 12,
                      color: token.colorTextDisabled,
                      marginTop: 2,
                      display: 'block',
                    }}
                  >
                    Passato
                  </Text>
                </Card>
              );
            }

            // Free slot
            return (
              <Card
                key={hour}
                size="small"
                hoverable
                onClick={() => handleSlotClick(hour)}
                style={{
                  borderLeft: `4px solid ${token.colorSuccess}`,
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: '10px 14px' } }}
              >
                <Flex justify="space-between" align="center">
                  <Space>
                    <Text
                      strong
                      style={{ color: token.colorSuccess, fontSize: 15 }}
                    >
                      {label}
                    </Text>
                    <Text type="secondary">– {endLabel}</Text>
                  </Space>
                  <PlusOutlined style={{ color: token.colorSuccess }} />
                </Flex>
                <Text
                  style={{
                    fontSize: 12,
                    color: token.colorSuccessText,
                    marginTop: 2,
                    display: 'block',
                  }}
                >
                  Disponibile
                </Text>
              </Card>
            );
          })}
        </div>
      )}
    </Space>
  );
};
