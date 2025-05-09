import pygame
import random
import sys
import json
from pygame import mixer
from datetime import datetime
import os

"""
贪吃蛇游戏增强版
@author Your Name
@version 2.0
"""

# 定义字体路径
def get_font_path():
    """
    获取系统字体路径
    """
    windows_font_paths = [
        "C:/Windows/Fonts/msyh.ttc",     # 微软雅黑
        "C:/Windows/Fonts/simhei.ttf",   # 黑体
        "C:/Windows/Fonts/simsun.ttc",   # 宋体
        os.path.join(os.environ['WINDIR'], 'Fonts/msyh.ttc'),  # 另一种方式获取微软雅黑
    ]
    
    # 尝试所有可能的字体路径
    for font_path in windows_font_paths:
        if os.path.exists(font_path):
            return font_path
            
    return None

# 初始化字体
def init_fonts():
    """
    初始化游戏字体
    """
    global font_big, font_small
    
    font_path = get_font_path()
    if font_path:
        try:
            font_big = pygame.font.Font(font_path, 64)
            font_small = pygame.font.Font(font_path, 32)
        except:
            print("字体加载失败，使用系统默认字体")
            font_big = pygame.font.SysFont("arial", 64)
            font_small = pygame.font.SysFont("arial", 32)
    else:
        print("未找到合适的中文字体，使用系统默认字体")
        font_big = pygame.font.SysFont("arial", 64)
        font_small = pygame.font.SysFont("arial", 32)

# 初始化 Pygame 和混音器
pygame.init()
mixer.init()

# 调用字体初始化
init_fonts()

# 定义颜色
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
GOLD = (255, 215, 0)

# 设置游戏窗口
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
BLOCK_SIZE = 20
# GAME_SPEED = 15  # 删除这行
# 添加以下新的速度设置
INITIAL_SPEED = 8     # 初始速度
MAX_SPEED = 20        # 最大速度
SPEED_INCREMENT = 0.5 # 速度增量

# 定义方向
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

# 创建游戏窗口
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption('贪吃蛇游戏')
clock = pygame.time.Clock()

class Snake:
    """
    蛇类，包含蛇的所有行为
    """
    def __init__(self):
        """
        初始化蛇的属性
        """
        self.length = 1
        self.positions = [(WINDOW_WIDTH//2, WINDOW_HEIGHT//2)]
        self.direction = random.choice([UP, DOWN, LEFT, RIGHT])
        self.color = GREEN
        
    def get_head_position(self):
        """
        获取蛇头位置
        @returns {tuple} 蛇头的坐标
        """
        return self.positions[0]
    
    def update(self):
        """
        更新蛇的位置
        """
        cur = self.get_head_position()
        x, y = self.direction
        new = ((cur[0] + (x*BLOCK_SIZE)) % WINDOW_WIDTH, 
               (cur[1] + (y*BLOCK_SIZE)) % WINDOW_HEIGHT)
        if new in self.positions[3:]:
            return False
        self.positions.insert(0, new)
        if len(self.positions) > self.length:
            self.positions.pop()
        return True
    
    def draw(self, surface):
        """
        绘制蛇
        @param surface - 游戏表面
        """
        for p in self.positions:
            pygame.draw.rect(surface, self.color, 
                           (p[0], p[1], BLOCK_SIZE, BLOCK_SIZE))

class Food:
    """
    食物类
    """
    def __init__(self):
        """
        初始化食物属性
        """
        self.position = (0, 0)
        self.color = RED
        self.randomize_position()
        
    def randomize_position(self):
        """
        随机生成食物位置
        """
        self.position = (random.randint(0, (WINDOW_WIDTH-BLOCK_SIZE)//BLOCK_SIZE) * BLOCK_SIZE,
                        random.randint(0, (WINDOW_HEIGHT-BLOCK_SIZE)//BLOCK_SIZE) * BLOCK_SIZE)
    
    def draw(self, surface):
        """
        绘制食物
        @param surface - 游戏表面
        """
        pygame.draw.rect(surface, self.color,
                        (self.position[0], self.position[1], BLOCK_SIZE, BLOCK_SIZE))

class SpecialFood(Food):
    """
    特殊食物类
    @extends Food
    """
    def __init__(self):
        super().__init__()
        self.types = {
            'golden': {
                'color': (255, 215, 0),  # 金色
                'points': 30,            # 得分
                'probability': 0.2,      # 出现概率
                'lifetime': 150          # 持续时间
            },
            'silver': {
                'color': (192, 192, 192),  # 银色
                'points': 20,              # 得分
                'probability': 0.3,        # 出现概率
                'lifetime': 100            # 持续时间
            },
            'poison': {
                'color': (128, 0, 128),    # 紫色
                'points': -10,             # 减分
                'probability': 0.5,        # 出现概率
                'lifetime': 80             # 持续时间
            }
        }
        self._generate_special_food()
        
    def _generate_special_food(self):
        """
        生成特殊食物
        """
        weights = [self.types[t]['probability'] for t in self.types]
        self.type = random.choices(list(self.types.keys()), weights=weights)[0]
        self.color = self.types[self.type]['color']
        self.points = self.types[self.type]['points']
        self.lifetime = self.types[self.type]['lifetime']
        self.start_time = pygame.time.get_ticks()
        self.randomize_position()
        
    def update(self):
        """
        更新特殊食物状态
        @return: bool 食物是否还存在
        """
        current_time = pygame.time.get_ticks()
        if current_time - self.start_time > self.lifetime * 10:  # 转换为毫秒
            return False
        return True
        
    def draw(self, surface):
        """
        绘制特殊食物，添加闪烁效果
        @param surface: 游戏表面
        """
        current_time = pygame.time.get_ticks()
        if (current_time // 200) % 2 == 0:  # 闪烁效果
            pygame.draw.rect(surface, self.color,
                           (self.position[0], self.position[1], 
                            BLOCK_SIZE, BLOCK_SIZE))

class Game:
    """
    游戏主类
    """
    def __init__(self):
        """
        初始化游戏
        """
        self.score = 0
        self.high_score = self.load_high_score()
        self.scores_history = self.load_scores_history()
        self.state = "START"
        self.speed = INITIAL_SPEED
        
    def load_high_score(self):
        """
        加载最高分
        @returns {int} 最高分
        """
        try:
            with open('high_score.json', 'r') as f:
                return json.load(f)['high_score']
        except:
            return 0
            
    def save_high_score(self):
        """
        保存最高分
        """
        with open('high_score.json', 'w') as f:
            json.dump({'high_score': self.high_score}, f)
            
    def load_scores_history(self):
        """
        加载历史分数记录
        @returns {list} 历史分数列表
        """
        try:
            with open('scores_history.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("历史分数文件未找到，将创建新文件。")
            return []
        except Exception as e:
            print(f"加载历史分数记录时出错: {e}")
            return []

    def save_score_to_history(self):
        """
        保存当前分数到历史记录
        """
        if self.score > 0:  # 只保存大于0的分数
            score_record = {
                'score': self.score,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            }
            self.scores_history.append(score_record)
            # 按分数排序并只保留前50个最高分
            self.scores_history = sorted(self.scores_history, 
                                       key=lambda x: x['score'], 
                                       reverse=True)[:50]
            
            # 保存到文件
            try:
                with open('scores_history.json', 'w', encoding='utf-8') as f:
                    json.dump(self.scores_history, f, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f"保存历史记录时出错: {e}")

    def draw_text(self, text, font, color, x, y):
        """
        绘制文本
        @param text - 文本内容
        @param font - 字体
        @param color - 颜色
        @param x - x坐标
        @param y - y坐标
        """
        try:
            text_surface = font.render(text, True, color)
            text_rect = text_surface.get_rect()
            text_rect.center = (x, y)
            screen.blit(text_surface, text_rect)
        except Exception as e:
            print(f"渲染文本时出错: {e}")
        
    def draw_score(self):
        """
        绘制分数
        """
        score_text = f"分数: {self.score}"
        high_score_text = f"最高分: {self.high_score}"
        self.draw_text(score_text, font_small, WHITE, 100, 30)
        self.draw_text(high_score_text, font_small, WHITE, 100, 60)
        
    def show_start_screen(self):
        """
        显示开始界面
        """
        screen.fill(BLACK)
        self.draw_text("贪吃蛇", font_big, GREEN, WINDOW_WIDTH//2, WINDOW_HEIGHT//3)
        self.draw_text("按空格键开始游戏", font_small, WHITE, WINDOW_WIDTH//2, WINDOW_HEIGHT//2)
        self.draw_text(f"最高分: {self.high_score}", font_small, WHITE, WINDOW_WIDTH//2, WINDOW_HEIGHT*2//3)
        pygame.display.update()
        
    def show_history_screen(self):
        """
        显示历史记录界面
        """
        screen.fill(BLACK)
        self.draw_text("历史最高分", font_big, GREEN, 
                      WINDOW_WIDTH//2, 50)
        
        start_y = 150
        for i, record in enumerate(self.scores_history[:10]):
            score_text = f"{i+1}. 分数: {record['score']} - {record['date']}"
            self.draw_text(score_text, font_small, WHITE, 
                          WINDOW_WIDTH//2, start_y + i * 40)
        
        self.draw_text("按 H 返回", font_small, WHITE, 
                      WINDOW_WIDTH//2, WINDOW_HEIGHT - 50)
        pygame.display.update()

    def show_game_over_screen(self):
        """
        显示游戏结束界面
        """
        screen.fill(BLACK)
        self.draw_text(u"游戏结束!", font_big, RED, WINDOW_WIDTH//2, WINDOW_HEIGHT//3)
        self.draw_text(u"最终得分: {}".format(self.score), font_small, WHITE, 
                      WINDOW_WIDTH//2, WINDOW_HEIGHT//2)
        self.draw_text(u"按空格键重新开始", font_small, WHITE, 
                      WINDOW_WIDTH//2, WINDOW_HEIGHT*2//3)
        self.draw_text(u"按 H 键查看历史记录", font_small, WHITE, 
                      WINDOW_WIDTH//2, WINDOW_HEIGHT*2//3 + 40)
        pygame.display.update()

    def increase_speed(self):
        """
        增加游戏速度
        """
        if self.speed < MAX_SPEED:
            self.speed += SPEED_INCREMENT

class SoundManager:
    """
    声音管理类
    """
    def __init__(self):
        self.sounds = self._load_sounds()
        
    def _load_sounds(self):
        """
        加载声音文件
        """
        sounds = {}
        try:
            sounds['eat'] = mixer.Sound('sounds/eat.wav')
            sounds['death'] = mixer.Sound('sounds/death.wav')
        except:
            print("警告：无法加载声音文件")
        return sounds
        
    def play_sound(self, sound_name):
        """
        播放声音
        @param sound_name: 声音名称
        """
        if sound_name in self.sounds:
            self.sounds[sound_name].play()

def main():
    """
    游戏主循环
    """
    game = Game()
    snake = None
    food = None
    sound_manager = SoundManager()
    
    while True:
        events = pygame.event.get()
        for event in events:
            if event.type == pygame.QUIT:
                _quit_game()
                
        if game.state == "START":
            new_snake, new_food = _handle_start_state(game, events)
            if new_snake and new_food:  # 如果开始新游戏
                snake = new_snake
                food = new_food
                
        elif game.state == "PLAYING":
            if snake and food:  # 确保对象存在
                _handle_playing_state(game, snake, food, sound_manager, events)
            else:
                game.state = "START"  # 如果对象不存在，返回开始状态
                
        elif game.state == "GAME_OVER":
            _handle_game_over_state(game, events)
            if game.state == "PLAYING":  # 如果从游戏结束转到开始游戏
                snake = Snake()
                food = Food()
                
        elif game.state == "HISTORY":
            _handle_history_state(game, events)
            
def _quit_game():
    """
    退出游戏
    """
    pygame.quit()
    sys.exit()

def _handle_start_state(game, events):
    """
    处理开始状态
    @param game: 游戏实例
    @param events: 事件列表
    @return: (Snake, Food) 如果开始游戏，否则 (None, None)
    """
    game.show_start_screen()
    for event in events:
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                game.state = "PLAYING"
                game.score = 0
                return Snake(), Food()
            elif event.key == pygame.K_h:
                game.state = "HISTORY"
    return None, None

def _handle_playing_state(game, snake, food, sound_manager, events):
    """
    处理游戏进行状态
    """
    for event in events:
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP and snake.direction != DOWN:
                snake.direction = UP
            elif event.key == pygame.K_DOWN and snake.direction != UP:
                snake.direction = DOWN
            elif event.key == pygame.K_LEFT and snake.direction != RIGHT:
                snake.direction = LEFT
            elif event.key == pygame.K_RIGHT and snake.direction != LEFT:
                snake.direction = RIGHT
            elif event.key == pygame.K_h:
                game.state = "HISTORY"
    
    if not snake.update():
        sound_manager.play_sound('death')
        game.state = "GAME_OVER"
        if game.score > game.high_score:
            game.high_score = game.score
            game.save_high_score()
        return
        
    if snake.get_head_position() == food.position:
        sound_manager.play_sound('eat')
        snake.length += 1
        game.score += 10
        food.randomize_position()
        
    screen.fill(BLACK)
    snake.draw(screen)
    food.draw(screen)
    game.draw_score()
    pygame.display.update()
    clock.tick(game.speed)

def _handle_game_over_state(game, events):
    """
    处理游戏结束状态
    """
    game.show_game_over_screen()
    for event in events:
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                game.state = "PLAYING"
                snake = Snake()
                food = Food()
                game.score = 0
                game.speed = INITIAL_SPEED
            elif event.key == pygame.K_h:
                game.state = "HISTORY"

def _handle_history_state(game, events):
    """
    处理历史记录状态
    """
    game.show_history_screen()
    for event in events:
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_h:
                # 按 H 键返回游戏结束界面
                game.state = "GAME_OVER"

if __name__ == '__main__':
    main()