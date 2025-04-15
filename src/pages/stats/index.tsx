import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiDS } from '../../api/impl/ds/ApiDS';
import Button from '../../components/form/Button';
import Select from '../../components/form/Select';
import DataRepo from "@api/datasource";

// Interfaz para los períodos con transacciones
interface TransactionPeriod {
  year: number;
  months: number[];
}

// Interfaz para los datos de estadísticas
interface StatsData {
  labels: string[];
  data: number[];
  total: number;
}

const StatsPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Manejar cambio de pestaña
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  // Manejar cambio de año
  const handleYearChange = (value: string) => {
    setYear(parseInt(value));
  };

  // Manejar cambio de mes
  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value));
  };

  // Consulta para obtener los períodos con transacciones
  const { data: periodsData, isLoading: isPeriodsLoading } = useQuery({
    queryKey: ['transactionPeriods'],
    queryFn: () => apiDS.fetchTransactionPeriods(),
    enabled: authState.isAuthenticated,
    retry: 1,
  });

  // Consultas para obtener datos de estadísticas
  const { data: dailyStats, isLoading: isDailyLoading, refetch: refetchDaily } = useQuery({
    queryKey: ['dailyStats', year, month],
    queryFn: () => apiDS.fetchDailyStats(year, month),
    enabled: authState.isAuthenticated && availableYears.length > 0,
    retry: 1,
  });

  const { data: weeklyStats, isLoading: isWeeklyLoading, refetch: refetchWeekly } = useQuery({
    queryKey: ['weeklyStats', year, month],
    queryFn: () => apiDS.fetchWeeklyStats(year, month),
    enabled: authState.isAuthenticated && availableYears.length > 0,
    retry: 1,
  });

  const { data: categoryStats, isLoading: isCategoryLoading, refetch: refetchCategory } = useQuery({
    queryKey: ['categoryStats', year, month],
    queryFn: () => apiDS.fetchCategoryStats(year, month),
    enabled: authState.isAuthenticated && availableYears.length > 0,
    retry: 1,
  });

  // Procesar los datos de períodos cuando se cargan
  useEffect(() => {
    if (periodsData?.success && periodsData.periods.length > 0) {
      // Obtener años disponibles
      const years = periodsData.periods.map(period => period.year.toString());
      setAvailableYears(years);
      
      // Establecer el año más reciente si el actual no está disponible
      if (!years.includes(year.toString())) {
        setYear(parseInt(years[0]));
      }
      
      // Obtener meses disponibles para el año seleccionado
      const selectedPeriod = periodsData.periods.find(p => p.year === year);
      if (selectedPeriod) {
        const months = selectedPeriod.months.map(m => m.toString());
        setAvailableMonths(months);
        
        // Establecer el mes más reciente si el actual no está disponible
        if (!months.includes(month.toString())) {
          setMonth(parseInt(months[0]));
        }
      } else {
        setAvailableMonths([]);
      }
    } else if (periodsData?.success && periodsData.periods.length === 0) {
      // No hay datos disponibles
      setAvailableYears([]);
      setAvailableMonths([]);
    }
  }, [periodsData, year]);
  
  // Actualizar datos cuando cambia el año o mes
  useEffect(() => {
    if (authState.isAuthenticated && availableYears.length > 0) {
      refetchDaily();
      refetchWeekly();
      refetchCategory();
    }
  }, [year, month, authState.isAuthenticated, availableYears, refetchDaily, refetchWeekly, refetchCategory]);



  // Etiquetas para los meses
  const monthLabels: {[key: string]: string} = {
    '1': 'Enero',
    '2': 'Febrero',
    '3': 'Marzo',
    '4': 'Abril',
    '5': 'Mayo',
    '6': 'Junio',
    '7': 'Julio',
    '8': 'Agosto',
    '9': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre'
  };

  return (
    <div className="cd-container cd-mx-auto cd-px-4 cd-py-8">
      <h1 className="cd-text-2xl cd-font-bold cd-mb-6 cd-text-gray-900 dark:cd-text-gray-100">Estadísticas de Gastos</h1>

      <div className="cd-grid cd-grid-cols-1 md:cd-grid-cols-2 cd-gap-4 cd-mb-6">
        <div>
          {isPeriodsLoading ? (
            <div className="cd-flex cd-items-center cd-mb-4">
              <div className="cd-animate-spin cd-rounded-full cd-h-5 cd-w-5 cd-border-t-2 cd-border-b-2 cd-border-indigo-500 cd-mr-2"></div>
              <span className="cd-text-gray-500 dark:cd-text-gray-400">Cargando años...</span>
            </div>
          ) : (
            <Select
              label="Año"
              options={availableYears}
              value={availableYears.includes(year.toString()) ? year.toString() : ''}
              onChange={handleYearChange}
              className="cd-mb-4"
            />
          )}
          {!isPeriodsLoading && availableYears.length === 0 && (
            <p className="cd-text-sm cd-text-gray-600 dark:cd-text-gray-400 cd-mt-1">No hay años con transacciones</p>
          )}
        </div>
        <div>
          {isPeriodsLoading ? (
            <div className="cd-flex cd-items-center cd-mb-4">
              <div className="cd-animate-spin cd-rounded-full cd-h-5 cd-w-5 cd-border-t-2 cd-border-b-2 cd-border-indigo-500 cd-mr-2"></div>
              <span className="cd-text-gray-500 dark:cd-text-gray-400">Cargando meses...</span>
            </div>
          ) : (
            <Select
              label="Mes"
              options={availableMonths}
              value={availableMonths.includes(month.toString()) ? month.toString() : ''}
              onChange={handleMonthChange}
              className="cd-mb-4"
            />
          )}
          {!isPeriodsLoading && availableMonths.length === 0 && (
            <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400 cd-mt-1">No hay meses con transacciones</p>
          )}
        </div>
      </div>

      <div className="cd-flex cd-space-x-4 cd-border-b cd-border-gray-200 dark:cd-border-gray-700 cd-mb-6">
        <button
          className={`cd-px-4 cd-py-2 cd-font-medium ${tabValue === 0 ? 'cd-border-b-2 cd-border-indigo-500 cd-text-indigo-600 dark:cd-text-indigo-400' : 'cd-text-gray-500 dark:cd-text-gray-400'}`}
          onClick={() => handleTabChange(0)}
        >
          Diario
        </button>
        <button
          className={`cd-px-4 cd-py-2 cd-font-medium ${tabValue === 1 ? 'cd-border-b-2 cd-border-indigo-500 cd-text-indigo-600 dark:cd-text-indigo-400' : 'cd-text-gray-500 dark:cd-text-gray-400'}`}
          onClick={() => handleTabChange(1)}
        >
          Semanal
        </button>
        <button
          className={`cd-px-4 cd-py-2 cd-font-medium ${tabValue === 2 ? 'cd-border-b-2 cd-border-indigo-500 cd-text-indigo-600 dark:cd-text-indigo-400' : 'cd-text-gray-500 dark:cd-text-gray-400'}`}
          onClick={() => handleTabChange(2)}
        >
          Por Categoría
        </button>
      </div>

      {tabValue === 0 && (
        <div className="cd-bg-white dark:cd-bg-gray-800 cd-shadow cd-rounded-lg cd-p-6">
          <h2 className="cd-text-xl cd-font-semibold cd-mb-4 cd-text-gray-900 dark:cd-text-gray-100">
            Movimientos Diarios - {monthLabels[month.toString()]} {year}
          </h2>
          {isDailyLoading ? (
            <div className="cd-flex cd-justify-center cd-items-center cd-p-8">
              <div className="cd-animate-spin cd-rounded-full cd-h-8 cd-w-8 cd-border-t-2 cd-border-b-2 cd-border-indigo-500"></div>
            </div>
          ) : dailyStats?.stats.detailedStats?.length ? (
            <>
              <div className="cd-overflow-x-auto">
                <table className="cd-min-w-full cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                  <thead className="cd-bg-gray-50 dark:cd-bg-gray-700">
                    <tr>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Día</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Ingresos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Gastos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="cd-bg-white dark:cd-bg-gray-800 cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                    {dailyStats.stats.detailedStats.map((stat, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'cd-bg-gray-50 dark:cd-bg-gray-900' : 'cd-bg-white dark:cd-bg-gray-800'}>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">{stat.dayName}</td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-green-600 dark:cd-text-green-400">
                          ${stat.income.toFixed(2)}
                        </td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-red-600 dark:cd-text-red-400">
                          ${stat.expense.toFixed(2)}
                        </td>
                        <td className={`cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium ${stat.total >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                          ${stat.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cd-mt-6 cd-p-4 cd-bg-gray-50 dark:cd-bg-gray-700 cd-rounded-lg cd-grid cd-grid-cols-1 md:cd-grid-cols-3 cd-gap-4">
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de ingresos: <span className="cd-text-green-600 dark:cd-text-green-400 cd-font-bold">${dailyStats?.stats.totalIncome.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de gastos: <span className="cd-text-red-600 dark:cd-text-red-400 cd-font-bold">${dailyStats?.stats.totalExpense.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Balance: <span className={`cd-font-bold ${dailyStats?.stats.totalBalance >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                      ${dailyStats?.stats.totalBalance.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="cd-text-center cd-p-8 cd-text-gray-500 dark:cd-text-gray-400">
              <svg className="cd-w-12 cd-h-12 cd-mx-auto cd-text-gray-400 dark:cd-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="cd-mt-2 cd-text-gray-600 dark:cd-text-gray-400">No hay datos disponibles para este período</p>
            </div>
          )}
        </div>
      )}

      {tabValue === 1 && (
        <div className="cd-bg-white dark:cd-bg-gray-800 cd-shadow cd-rounded-lg cd-p-6">
          <h2 className="cd-text-xl cd-font-semibold cd-mb-4 cd-text-gray-900 dark:cd-text-gray-100">
            Movimientos Semanales - {monthLabels[month.toString()]} {year}
          </h2>
          {isWeeklyLoading ? (
            <div className="cd-flex cd-justify-center cd-items-center cd-p-8">
              <div className="cd-animate-spin cd-rounded-full cd-h-8 cd-w-8 cd-border-t-2 cd-border-b-2 cd-border-indigo-500"></div>
            </div>
          ) : weeklyStats?.stats.detailedStats?.length ? (
            <>
              <div className="cd-overflow-x-auto">
                <table className="cd-min-w-full cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                  <thead className="cd-bg-gray-50 dark:cd-bg-gray-700">
                    <tr>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Semana</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Ingresos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Gastos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="cd-bg-white dark:cd-bg-gray-800 cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                    {weeklyStats.stats.detailedStats.map((stat, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'cd-bg-gray-50 dark:cd-bg-gray-900' : 'cd-bg-white dark:cd-bg-gray-800'}>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">{stat.weekName}</td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-green-600 dark:cd-text-green-400">
                          ${stat.income.toFixed(2)}
                        </td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-red-600 dark:cd-text-red-400">
                          ${stat.expense.toFixed(2)}
                        </td>
                        <td className={`cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium ${stat.total >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                          ${stat.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cd-mt-6 cd-p-4 cd-bg-gray-50 dark:cd-bg-gray-700 cd-rounded-lg cd-grid cd-grid-cols-1 md:cd-grid-cols-3 cd-gap-4">
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de ingresos: <span className="cd-text-green-600 dark:cd-text-green-400 cd-font-bold">${weeklyStats?.stats.totalIncome.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de gastos: <span className="cd-text-red-600 dark:cd-text-red-400 cd-font-bold">${weeklyStats?.stats.totalExpense.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Balance: <span className={`cd-font-bold ${weeklyStats?.stats.totalBalance >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                      ${weeklyStats?.stats.totalBalance.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="cd-text-center cd-p-8 cd-text-gray-500 dark:cd-text-gray-400">
              <svg className="cd-w-12 cd-h-12 cd-mx-auto cd-text-gray-400 dark:cd-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="cd-mt-2 cd-text-gray-600 dark:cd-text-gray-400">No hay datos disponibles para este período</p>
            </div>
          )}
        </div>
      )}

      {tabValue === 2 && (
        <div className="cd-bg-white dark:cd-bg-gray-800 cd-shadow cd-rounded-lg cd-p-6">
          <h2 className="cd-text-xl cd-font-semibold cd-mb-4 cd-text-gray-900 dark:cd-text-gray-100">
            Movimientos por Categoría - {monthLabels[month.toString()]} {year}
          </h2>
          {isCategoryLoading ? (
            <div className="cd-flex cd-justify-center cd-items-center cd-p-8">
              <div className="cd-animate-spin cd-rounded-full cd-h-8 cd-w-8 cd-border-t-2 cd-border-b-2 cd-border-indigo-500"></div>
            </div>
          ) : categoryStats?.stats.detailedStats?.length ? (
            <>
              <div className="cd-overflow-x-auto">
                <table className="cd-min-w-full cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                  <thead className="cd-bg-gray-50 dark:cd-bg-gray-700">
                    <tr>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Categoría</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Ingresos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Gastos</th>
                      <th scope="col" className="cd-px-6 cd-py-3 cd-text-left cd-text-xs cd-font-medium cd-text-gray-500 dark:cd-text-gray-300 cd-uppercase cd-tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="cd-bg-white dark:cd-bg-gray-800 cd-divide-y cd-divide-gray-200 dark:cd-divide-gray-700">
                    {categoryStats.stats.detailedStats.map((stat, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'cd-bg-gray-50 dark:cd-bg-gray-900' : 'cd-bg-white dark:cd-bg-gray-800'}>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">{stat.category}</td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-green-600 dark:cd-text-green-400">
                          ${stat.income.toFixed(2)}
                        </td>
                        <td className="cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium cd-text-red-600 dark:cd-text-red-400">
                          ${stat.expense.toFixed(2)}
                        </td>
                        <td className={`cd-px-6 cd-py-4 cd-whitespace-nowrap cd-text-sm cd-font-medium ${stat.total >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                          ${stat.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cd-mt-6 cd-p-4 cd-bg-gray-50 dark:cd-bg-gray-700 cd-rounded-lg cd-grid cd-grid-cols-1 md:cd-grid-cols-3 cd-gap-4">
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de ingresos: <span className="cd-text-green-600 dark:cd-text-green-400 cd-font-bold">${categoryStats?.stats.totalIncome.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Total de gastos: <span className="cd-text-red-600 dark:cd-text-red-400 cd-font-bold">${categoryStats?.stats.totalExpense.toFixed(2)}</span>
                  </p>
                </div>
                <div>
                  <p className="cd-font-medium cd-text-gray-900 dark:cd-text-gray-100">
                    Balance: <span className={`cd-font-bold ${categoryStats?.stats.totalBalance >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                      ${categoryStats?.stats.totalBalance.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="cd-text-center cd-p-8 cd-text-gray-500 dark:cd-text-gray-400">
              <svg className="cd-w-12 cd-h-12 cd-mx-auto cd-text-gray-400 dark:cd-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="cd-mt-2 cd-text-gray-600 dark:cd-text-gray-400">No hay datos disponibles para este período</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPage;
