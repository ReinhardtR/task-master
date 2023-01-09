import Pusher from "pusher-js";
import { createStore } from "zustand";
import { createContext, useContext, useEffect, useState } from "react";
import { PusherEvent, PRIVATE_PUSHER_EVENTS } from "./pusher-events";

Pusher.logToConsole = true;

const getPusherClient = () => {
  if (Pusher.instances.length) {
    const client = Pusher.instances[0];
    client.connect();
    return client;
  }

  return new Pusher("b49c956b6bbe9c676854", {
    cluster: "us2",
    userAuthentication: {
      endpoint: "/api/pusher/user-auth",
      transport: "ajax",
    },
    channelAuthorization: {
      endpoint: "/api/pusher/channel-auth",
      transport: "ajax",
    },
  });
};

const createPusherStore = () => {
  const pusherClient = getPusherClient();

  const store = createStore(() => ({
    pusherClient,
  }));

  return store;
};

type PusherStore = ReturnType<typeof createPusherStore>;

const PusherContext = createContext<PusherStore | null>(null);

type PusherProviderProps = {
  children: React.ReactNode;
};

export const PusherProvider = ({ children }: PusherProviderProps) => {
  const [store, setStore] = useState<PusherStore>();

  useEffect(() => {
    const newStore = createPusherStore();
    setStore(newStore);

    return () => {
      const { pusherClient } = newStore.getState();

      console.log("disconnecting pusher and destroying store", pusherClient);
      console.log(
        "(Expect a warning in terminal after this, React Dev Mode and all)"
      );

      pusherClient.disconnect();
      newStore.destroy();
    };
  }, []);

  if (!store) return null;

  return (
    <PusherContext.Provider value={store}>{children}</PusherContext.Provider>
  );
};

const usePusherEvent = (
  channelName: string,
  eventName: string,
  callback: (data: unknown) => void
) => {
  const store = useContext(PusherContext);

  if (!store) {
    throw new Error("usePusherEvent must be used within a PusherProvider");
  }

  const { pusherClient } = store.getState();

  useEffect(() => {
    const invokeCallback = (data: unknown) => {
      callback(data);
    };

    const channel = pusherClient.subscribe(channelName);

    channel.bind(eventName, invokeCallback);

    return () => {
      channel.unbind(eventName, invokeCallback);
    };
  }, [channelName, eventName]);
};

const createTypeSafePublicEventHook = <T extends any>(
  event: PusherEvent<T>
) => {
  return (callback: (data: T) => void) => {
    usePusherEvent(event.channelName, event.eventName, (data: unknown) => {
      const parsedData = event.schema.parse(data);
      callback(parsedData);
    });
  };
};

const createTypeSafePrivateEventHook = <T extends any>(
  event: PusherEvent<T>
) => {
  return (uniqueId: string, callback: (data: T) => void) => {
    usePusherEvent(
      `${event.channelName}-${uniqueId}`,
      event.eventName,
      (data: unknown) => {
        const parsedData = event.schema.parse(data);
        callback(parsedData);
      }
    );
  };
};

export const useBoardShapeChangedEvent = createTypeSafePrivateEventHook(
  PRIVATE_PUSHER_EVENTS.BOARD_UPDATE
);

export const usePusherSocketId = () => {
  const store = useContext(PusherContext);

  if (!store) {
    throw new Error("usePusherSocketId must be used within a PusherProvider");
  }

  const { pusherClient } = store.getState();

  return pusherClient.connection.socket_id;
};
