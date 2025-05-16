import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TransferArgs {
  from: string;
  to: string;
  value: string;
}

interface TransferEvent {
  eventName: string;
  // args: TransferArgs;
  from: string;
  to: string;
  value: string;
  removed: boolean;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  topics: string[];
}

interface TransferListProps {
  fromAddress?: string;
}

  const truncateAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
};

const TransferList: React.FC<TransferListProps> = ({ fromAddress }) => {
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async (from?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = from 
        ? `http://localhost:8080/api/events/${from}`
        : 'http://localhost:8080/api/events';
      const response = await axios.get(url);
      console.log(response.data);
      setTransfers(response.data);
    } catch (err) {
      setError('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers(fromAddress);
  }, [fromAddress]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

return (
  <div className="max-w-6xl mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4">
      {fromAddress ? `Transfers from ${fromAddress}` : 'All Transfer Events'}
    </h2>

    <div className="border rounded-md overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx Hash</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <tr key={transfer.transactionHash} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm break-all">{transfer.from}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm break-all">
                {/* {transfer.to} */}
                {truncateAddress(transfer.to)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.value}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.blockNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm break-all">
                <a href={`https://sepolia.etherscan.io/tx/${transfer.transactionHash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  {/* {transfer.transactionHash} */}
                  {truncateAddress(transfer.transactionHash)}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm break-all">
                {/* {transfer.address} */}
                {truncateAddress(transfer.address)}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default TransferList; 