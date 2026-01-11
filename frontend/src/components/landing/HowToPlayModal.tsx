import Modal from '../common/Modal';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Play Mancala">
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-bold mb-2">Objective</h3>
          <p>To collect as many seeds in your store as possible. The player with the most seeds in their store at the end of the game wins.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Set Up</h3>
          <p>Place four seeds in each of the six pits on your side of the game board. Your opponent should do the same. (For a shorter game, you can play with three seeds in each pit.)</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Basic Rules</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Play always moves around the board in a counter-clockwise circle (to the right)</li>
            <li>The store on your right belongs to you. That is where you keep the seeds you win.</li>
            <li>The six pits near you are your pits.</li>
            <li>Only use one hand to pick up and put down seeds.</li>
            <li>Once you touch the seeds in a pit, you must move those seeds.</li>
            <li>Only put seeds in your own store, not your opponent's store.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Starting the Game</h3>
          <p>On a turn, a player picks up all the seeds in one pit and "sows" them to the right, placing one seed in each of the pits along the way. If you come to your store, then add a seed to your store and continue. You may end up putting seeds in your opponent's pits along the way.</p>
          <p className="mt-2">Play alternates back and forth, with opponents picking up the seeds in one of their pits and distributing them one at a time into the pits on the right, beginning in the pit immediately to the right.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Special Rules</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Extra Turn:</strong> When the last seed in your hand lands in your store, take another turn.</li>
            <li><strong>Capture:</strong> When the last seed in your hand lands in one of your own pits, if that pit had been empty you get to keep all the seeds in your opponent's pit on the opposite side. Put those captured seeds, as well as the last seed that you just played on your side, into the store.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Ending the Game</h3>
          <p>The game is over when one player's pits are completely empty. The other player takes the seeds remaining in their pits and puts those seeds in their store. Count up the seeds. Whoever has the most seeds wins.</p>
        </div>
      </div>
    </Modal>
  );
}
