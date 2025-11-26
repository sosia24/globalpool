export interface Participation {
    sessao: number;
    claim: number;
  }
  
  export interface Pool {
    nome: string;
    id: number;
    position: number;
    color: string;
    image: string;
    members: number;
    value: number;
    nextPay: string;
    poolPrice: string;
    userParticipation: Participation[];
  }
  
  export interface claimableSessions {
      poolId: number;
      sessionId: number;
      value: number;
  }